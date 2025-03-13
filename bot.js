require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text.includes("$W3LABS Balance")) {
        bot.sendMessage(chatId, "✅ Web3 transaction received! Checking balance...");
    } else {
        bot.sendMessage(chatId, "Hello! I'm the Web3 Chain Labs AI Bot. How can I assist you?");
    }
});

console.log("Telegram bot is running...");
