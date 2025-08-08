require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const downloadInstagramVideo = require('./downloader');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '👋 Send me any Instagram reel URL and I will download it for you!');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const url = msg.text;

  // Ignore /start and other non-URL messages
  if (typeof url !== 'string' || !url.startsWith('http')) return;


  bot.sendMessage(chatId, '⏳ Downloading video... Please wait.');

  try {
    const videoPath = await downloadInstagramVideo(url);
    await bot.sendVideo(chatId, videoPath, { caption: '✅ Here is your reel!' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    bot.sendMessage(chatId, '❌ Failed to download the video. Make sure the URL is correct.');
  }
});
