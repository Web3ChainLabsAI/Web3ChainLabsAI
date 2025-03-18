const tokenAddress = "0x00Ae43d74aD13b675a50aB10393eeE9300F3bCf1";  // Трябва да се замени с реалния адрес след деплой
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

    // Изпращаме данните към Telegram бота
    sendBalanceToTelegram(userAddress, tokenBalance);
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
