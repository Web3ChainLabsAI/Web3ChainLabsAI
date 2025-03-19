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
        getTokenBalance(accounts[0]);
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

async function buyTokens(ethAmount) {
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

        const ethWei = web3.utils.toWei(ethAmount, 'ether');
        console.log(`Sending ${ethAmount} ETH to ${preSaleContractAddress}`);

        // Оценка на газа
        const gasEstimate = await contract.methods.buyTokens().estimateGas({
            from: accounts[0],
            value: ethWei
        });
        console.log(`Estimated gas: ${gasEstimate}`);

        // Изпращане на транзакцията с висок газ лимит
        const tx = await contract.methods.buyTokens().send({
            from: accounts[0],
            value: ethWei,
            gas: Math.max(gasEstimate * 1.5, 500000) // Увеличен на 500,000 с 50% буфер
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
