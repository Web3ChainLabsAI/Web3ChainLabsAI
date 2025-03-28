const preSaleContractAddress = "0x7e3Ec9F4b530b1BB6143EE3D4B6d218610D3F76D";
const tokenAddress = "0x00Ae43d74aD13b675a50aB10393eeE9300F3bCf1";

const preSaleABI = [
    {
        "constant": false,
        "inputs": [],
        "name": "buyTokens",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amountETH", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "tokensReceived", "type": "uint256"}
        ],
        "name": "TokensPurchased",
        "type": "event"
    }
];

const tokenABI = [
    {
        "constant": true,
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    }
];

async function connectWallet() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        if (chainId !== "0x1") {
            alert("Please switch to Ethereum Mainnet (Chain ID: 1)");
            return;
        }
        document.getElementById('walletAddress').innerText = `Connected: ${accounts[0]}`;
    } catch (error) {
        alert("Wallet connection failed: " + error.message);
        console.error(error);
    }
}

async function getTokenBalance() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        if (!accounts || accounts.length === 0) {
            alert("No wallet connected!");
            return;
        }

        const balance = await contract.methods.balanceOf(accounts[0]).call();
        const tokenBalance = web3.utils.fromWei(balance, 'ether');
        alert(`Your $W3LABS Balance: ${tokenBalance} tokens`);
    } catch (error) {
        alert("Balance check failed: " + error.message);
        console.error(error);
    }
}

function calculateTokens() {
    const ethAmountInput = document.getElementById('ethAmount').value;
    const tokenDisplay = document.getElementById('tokenAmount');
    if (!ethAmountInput || parseFloat(ethAmountInput) <= 0) {
        tokenDisplay.innerText = "You will receive: 0 $W3LABS";
        return;
    }

    const tokensPerEth = 1000000; // Фаза 1: 1 ETH = 1,000,000 $W3LABS
    const tokenAmount = parseFloat(ethAmountInput) * tokensPerEth;
    tokenDisplay.innerText = `You will receive: ${tokenAmount.toLocaleString()} $W3LABS`;
}

async function buyTokens() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(preSaleABI, preSaleContractAddress);

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await ethereum.request({ method: 'eth_chainId' });

        if (chainId !== "0x1") {
            alert("Please switch to Ethereum Mainnet (Chain ID: 1)");
            return;
        }

        const ethAmount = document.getElementById('ethAmount').value;
        if (!ethAmount || parseFloat(ethAmount) <= 0) {
            alert("Please enter a valid ETH amount!");
            return;
        }
        if (parseFloat(ethAmount) > 5) {
            alert("Maximum purchase is 5 ETH!");
            return;
        }

        const ethWei = web3.utils.toBN(web3.utils.toWei(ethAmount.toString(), 'ether'));
        console.log(`Sending ${ethAmount} ETH (${ethWei.toString()} Wei) to ${preSaleContractAddress}`);

        const ethBalance = await web3.eth.getBalance(accounts[0]);
        const ethBalanceEth = web3.utils.fromWei(ethBalance, 'ether');

        console.log(`Your ETH balance: ${ethBalanceEth} ETH`);
        const minRequiredEth = (parseFloat(ethAmount) + 0.005).toString();
        if (parseFloat(ethBalanceEth) < parseFloat(minRequiredEth)) {
            alert("Insufficient ETH! You need at least " + minRequiredEth + " ETH including fees.");
            return;
        }

        const gasEstimate = await contract.methods.buyTokens().estimateGas({
            from: accounts[0],
            value: ethWei
        });
        console.log(`Estimated gas: ${gasEstimate}`);

        const gasLimit = web3.utils.toBN(Math.max(Math.floor(gasEstimate * 1.5), 300000));

        const tx = await contract.methods.buyTokens().send({
            from: accounts[0],
            value: ethWei.toString(),
            gas: gasLimit.toString()
        });

        alert(`Transaction successful! Tx Hash: ${tx.transactionHash}`);

        // ✅ Поправена проверка на баланса след покупката
        const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

        if (!accounts || accounts.length === 0) {
            alert("No wallet connected!");
            return;
        }

        const newBalance = await tokenContract.methods.balanceOf(accounts[0]).call();
        const newTokenBalance = web3.utils.fromWei(newBalance, 'ether');
        alert(`Your updated $W3LABS Balance: ${newTokenBalance} tokens`);
    } catch (error) {
        alert("Transaction failed: " + error.message);
        console.error(error);
    }
}
