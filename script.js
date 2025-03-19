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

async function getTokenBalance(userAddress) {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);
    try {
        const balance = await contract.methods.balanceOf(userAddress).call();
        const tokenBalance = web3.utils.fromWei(balance, 'ether');
        alert(`Your $W3LABS Balance: ${tokenBalance} tokens`);
    } catch (error) {
        alert("Balance check failed: " + error.message);
        console.error(error);
    }
}

function calculateTokens() {
    const ethAmount = document.getElementById('ethAmount').value;
    const tokenDisplay = document.getElementById('tokenAmount');
    if (!ethAmount || ethAmount <= 0) {
        tokenDisplay.innerText = "You will receive: 0 $W3LABS";
        return;
    }

    // Фаза 1: 1 ETH = 1,000,000 $W3LABS (до 17 май 2025)
    const tokensPerEth = 1000000;
    const tokenAmount = ethAmount * tokensPerEth;
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

        // Вземане на количеството като стринг
        const ethAmount = document.getElementById('ethAmount').value.toString();
        if (!ethAmount || parseFloat(ethAmount) <= 0) {
            alert("Please enter a valid ETH amount!");
            return;
        }
        if (parseFloat(ethAmount) > 5) {
            alert("Maximum purchase is 5 ETH!");
            return;
        }

        const ethWei = web3.utils.toWei(ethAmount, 'ether');
        console.log(`Sending ${ethAmount} ETH to ${preSaleContractAddress}`);

        // Проверка на ETH баланса
        const ethBalance = await web3.eth.getBalance(accounts[0]);
        const ethBalanceEth = web3.utils.fromWei(ethBalance, 'ether');
        console.log(`Your ETH balance: ${ethBalanceEth} ETH`);
        if (parseFloat(ethBalanceEth) < parseFloat(ethAmount) + 0.005) {
            alert("Insufficient ETH! You need at least " + (parseFloat(ethAmount) + 0.005) + " ETH including fees.");
            return;
        }

        // Оценка на газа
        const gasEstimate = await contract.methods.buyTokens().estimateGas({
            from: accounts[0],
            value: ethWei
        });
        console.log(`Estimated gas: ${gasEstimate}`);

        const tx = await contract.methods.buyTokens().send({
            from: accounts[0],
            value: ethWei,
            gas: Math.max(gasEstimate * 1.5, 300000)
        });
        alert(`Transaction successful! Tx Hash: ${tx.transactionHash}`);

        // Проверка на баланса след покупка
        const newBalance = await web3.eth.Contract(tokenABI, tokenAddress).methods.balanceOf(accounts[0]).call();
        const newTokenBalance = web3.utils.fromWei(newBalance, 'ether');
        alert(`Your updated $W3LABS Balance: ${newTokenBalance} tokens`);
    } catch (error) {
        alert("Transaction failed: " + error.message);
        console.error(error);
    }
}
