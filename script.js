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
        const expectedChainId = "0x1"; // Mainnet, сменете с вашата мрежа (напр. 0xaa36a7 за Sepolia)
        if (chainId !== expectedChainId) {
            alert(`Please switch to the correct network (Chain ID: ${parseInt(expectedChainId, 16)})`);
            return;
        }
        document.getElementById('walletAddress').innerText = `Connected: ${accounts[0]}`;
        await checkTokenBalance(accounts[0]);
    } catch (error) {
        console.error(error);
        alert("Wallet connection failed.");
    }
}

async function checkTokenBalance(userAddress) {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);
    try {
        const balance = await contract.methods.balanceOf(userAddress).call();
        const tokenBalance = web3.utils.fromWei(balance, 'ether');
        alert(`Your $W3LABS Balance: ${tokenBalance} tokens`);
    } catch (error) {
        alert("Error checking balance: " + error.message);
        console.error(error);
    }
}

async function buyTokens(ethAmount) {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    const web3 = new Web3(window.ethereum);
    const preSaleContract = new web3.eth.Contract(preSaleABI, preSaleContractAddress);
    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    // Проверка на мрежата
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const expectedChainId = "0x1"; // Mainnet, сменете с вашата мрежа
    if (chainId !== expectedChainId) {
        alert(`Please switch to the correct network (Chain ID: ${parseInt(expectedChainId, 16)})`);
        return;
    }

    try {
        const ethWei = web3.utils.toWei(ethAmount, 'ether');
        console.log(`Sending ${ethAmount} ETH to ${preSaleContractAddress}`);

        // Проверка на баланса преди покупка
        const initialBalance = await tokenContract.methods.balanceOf(accounts[0]).call();
        const initialTokenBalance = web3.utils.fromWei(initialBalance, 'ether');
        console.log(`Initial balance: ${initialTokenBalance} $W3LABS`);

        // Изпращане на транзакцията
        const tx = await preSaleContract.methods.buyTokens().send({
            from: accounts[0],
            value: ethWei,
            gas: 200000 // Лимит на газа
        });
        alert(`✅ Transaction successful! Tx Hash: ${tx.transactionHash}`);

        // Проверка на баланса след покупка
        const newBalance = await tokenContract.methods.balanceOf(accounts[0]).call();
        const newTokenBalance = web3.utils.fromWei(newBalance, 'ether');
        alert(`Your updated $W3LABS Balance: ${newTokenBalance} tokens`);
    } catch (error) {
        alert("❌ Transaction failed: " + error.message);
        console.error(error);
    }
}
