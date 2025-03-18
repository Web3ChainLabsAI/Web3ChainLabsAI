const tokenAddress = "0x00Ae43d74aD13b675a50aB10393eeE9300F3bCf1";  // Адрес на токена
const preSaleContractAddress = "0x7e3Ec9F4b530b1BB6143EE3D4B6d218610D3F76D";  // Адрес на PreSale контракта (сменете с реалния)

const tokenABI = [
    {
        "constant": true,
        "inputs": [{"name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    }
];

const preSaleABI = [
    {
        "constant": false,
        "inputs": [],
        "name": "buyTokens",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    }
];

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('walletAddress').innerText = `Connected: ${accounts[0]}`;
            checkTokenBalance(accounts[0]);
        } catch (error) {
            console.error(error);
            alert('Wallet connection failed.');
        }
    } else {
        alert('Please install MetaMask!');
    }
}

async function checkTokenBalance(userAddress) {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);
    const balance = await contract.methods.balanceOf(userAddress).call();
    const tokenBalance = web3.utils.fromWei(balance, 'ether');

    alert(`Your $W3LABS Balance: ${tokenBalance} tokens`);
    sendBalanceToTelegram(userAddress, tokenBalance);
}

async function buyTokens(ethAmount) {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(preSaleABI, preSaleContractAddress);
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    try {
        const ethWei = web3.utils.toWei(ethAmount, 'ether');
        await contract.methods.buyTokens().send({
            from: accounts[0],
            value: ethWei
        });

        alert("✅ Transaction successful! Check your wallet for tokens.");
    } catch (error) {
        alert("❌ Transaction failed: " + error.message);
    }
}

async function sendBalanceToTelegram(userAddress, tokenBalance) {
    const telegramBotURL = "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/sendMessage";
    
    const message = `User: ${userAddress}\n$W3LABS Balance: ${tokenBalance}`;
    
    await fetch(telegramBotURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: "@Web3ChainLabsAI",
            text: message
        })
    });
}
