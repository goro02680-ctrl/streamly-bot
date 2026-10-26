const { Telegraf, Markup } = require('telegraf');

// 1. Put your Bot Token here
const BOT_TOKEN = '8830348124:AAFvPdDeiXZDvQtSOxSQn4MdotW-72kR1aA';

// 2. Put your numeric Admin Chat ID here
const ADMIN_CHAT_ID = '8527693161'; 

const bot = new Telegraf(BOT_TOKEN);

// Main /start command
bot.start((ctx) => {
    ctx.reply(
        'Welcome to **Streamly TV** 🎬\nHow can we help you today? You can send your inquiry here and our support team will get back to you directly:',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📞 Contact Us', 'contact_us')],
                [Markup.button.callback('❓ FAQ', 'faq_menu')],
                [Markup.button.url('💬 Direct Support', 'https://t.me/nizarzouhier')]
            ])
        }
    );
});

// "Contact Us" button action
bot.action('contact_us', async (ctx) => {
    await ctx.answerCbQuery();
    const contactInfo = 
        "📌 **Streamly TV Support Information:**\n\n" +
        "📧 **Email:** support@streamly.tv\n" +
        "📱 **WhatsApp/Support:** +213000000000\n" +
        "⏰ **Working Hours:** All week (9:00 AM - 11:00 PM)\n\n" +
        "💬 Or simply, **type your message here in the bot** and it will be sent directly to us so we can reply shortly.";
    
    await ctx.editMessageText(contactInfo, { 
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.url('💬 Direct Support', 'https://t.me/nizarzouhier')],
            [Markup.button.callback('⬅️ Back to Main Menu', 'back_home')]
        ])
    });
});

// FAQ menu
bot.action('faq_menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        "❓ **Frequently Asked Questions (FAQ):**\nChoose a question to view the answer:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔹 How to activate subscriptions?', 'faq_1')],
                [Markup.button.callback('🔹 What devices are supported?', 'faq_2')],
                [Markup.button.callback('🔹 What to do if the stream stops?', 'faq_3')],
                [Markup.button.callback('⬅️ Back to Main Menu', 'back_home')]
            ])
        }
    );
});

// FAQ answers
bot.action('faq_1', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        "🔹 **How to activate subscriptions?**\n\n" +
        "After completing your payment, you will receive setup details (M3U link or Xtream Codes), which you can enter directly into the Streamly TV app.",
        { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]]) }
    );
});

bot.action('faq_2', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        "🔹 **What devices are supported?**\n\n" +
        "Streamly TV supports Smart TVs, Android TV boxes, and smartphones (Android & iOS).",
        { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]]) }
    );
});

bot.action('faq_3', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        "🔹 **What to do if the stream stops?**\n\n" +
        "Check your internet connection and restart the app. If the issue persists, message us directly through the bot.",
        { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]]) }
    );
});

// Back to main menu button
bot.action('back_home', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        'Welcome back to **Streamly TV** 🎬\nHow can we help you today?',
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📞 Contact Us', 'contact_us')],
                [Markup.button.callback('❓ FAQ', 'faq_menu')],
                [Markup.button.url('💬 Direct Support', 'https://t.me/nizarzouhier')]
            ])
        }
    );
});

// Messaging and forwarding system between user and admin
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username ? `@${ctx.from.username}` : 'No username';
    const firstName = ctx.from.first_name || 'User';
    const userText = ctx.message.text;

    // 1. If the message is from you (the Admin)
    if (userId.toString() === ADMIN_CHAT_ID.toString()) {
        if (ctx.message.reply_to_message) {
            const repliedText = ctx.message.reply_to_message.text || '';
            const match = repliedText.match(/🆔 ID: `(\d+)`/);
            
            if (match && match[1]) {
                const targetUserId = match[1];
                try {
                    await ctx.telegram.sendMessage(targetUserId, `💬 **Support Reply:**\n\n${userText}`);
                    await ctx.reply("✅ Reply sent to the user successfully.");
                } catch (err) {
                    await ctx.reply("❌ Failed to send reply, the user might have blocked the bot.");
                }
            } else {
                await ctx.reply("⚠️ Please use the Reply feature exclusively on the incoming client message that contains the ID.");
            }
        } else {
            await ctx.reply("Welcome back, Admin. To reply to any user, use **Reply** on their incoming message here in the bot.");
        }
        return;
    }

    // 2. If the message is from a regular customer
    const forwardText = 
        `📩 **New message from user:**\n` +
        `👤 Name: ${firstName}\n` +
        `🏷 Username: ${username}\n` +
        `🆔 ID: \`${userId}\`\n\n` +
        `💬 Text:\n${userText}`;

    try {
        await ctx.telegram.sendMessage(ADMIN_CHAT_ID, forwardText, { parse_mode: 'Markdown' });
        await ctx.reply("✅ Your message has been sent to the support team successfully. We will reply to you soon in this bot!");
    } catch (error) {
        console.error("Error forwarding message:", error);
        await ctx.reply("An error occurred while sending your message. You can contact us directly via @nizarzouhier");
    }
});

// Launch the bot
bot.launch();
console.log('Streamly TV Bot (Ticket System) is running successfully...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));