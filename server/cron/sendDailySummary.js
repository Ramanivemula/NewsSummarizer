const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');

const apiUrl = 'http://localhost:5000/api/news/personalized';

// ⏰ Schedule: Every day at 9 AM (adjust to your timezone as needed)
cron.schedule('54 2 * * *', async () => {
  console.log('🕘 Sending daily news summaries...');

  try {
    const users = await User.find({
      $or: [
        { 'preferences.notifyDaily': true },
        { notifyDaily: true }
      ]
    });

    for (const user of users) {
      try {
        const res = await axios.get(`${apiUrl}/${user._id}`);
        const news = res.data.articles || [];

        const summaryText = news.map((item, index) => 
          `${index + 1}️⃣ *${item.title}*\n${item.summary || 'No summary available.'}\n🔗 ${item.url}\n`
        ).join('\n');

        const message = `🗞️ Good Morning ${user.name}!\nHere is your personalized news summary for today:\n\n${summaryText}\n📬 Stay informed. Delivered by MeraPaper ✨`;

        const deliveryMethod = user.preferences?.deliveryMethod || user.deliveryMethod;

        if (deliveryMethod === 'email') {
          const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f4f4f4; border-radius: 8px; max-width: 800px; margin: 0 auto;">
              <h2 style="font-size: 24px; color: #1a73e8;">🗞️ Good Morning ${user.name}!</h2>
              <p style="font-size: 16px; line-height: 1.6;">Here is your personalized news summary for today:</p>
              
              ${news.map((item, index) => `
                <div style="padding: 10px; border-bottom: 1px solid #ddd; margin-bottom: 15px;">
                  <h3 style="color: #333; font-size: 18px; margin: 0 0 5px;">${index + 1}. ${item.title}</h3>
                  <p style="color: #555; margin: 0 0 10px;">${item.summary || 'No summary available.'}</p>
                  <p style="font-size: 12px; color: #777;">
                    📅 ${new Date(item.publishedAt || Date.now()).toLocaleDateString()} |
                    🌍 ${item.country || 'N/A'} |
                    🏷️ ${item.category || 'General'}
                  </p>
                  <a href="${item.url}" target="_blank" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Read more</a>
                </div>
              `).join('')}
              
              <hr style="border: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #888; text-align: center;">Sent by MeraPaper · Stay Informed ✨</p>
            </div>
          `;

          await sendEmail(user.email, 'Your Daily News Summary 📰', html);
        } else if (deliveryMethod === 'whatsapp') {
          await sendWhatsApp(user.phoneNumber, message);
        } else {
          console.warn(`⚠️ No delivery method set for ${user.name}`);
        }

        console.log(`✅ Sent to ${user.name} via ${deliveryMethod}`);
      } catch (err) {
        console.error(`❌ Error sending to ${user.name}:`, err.message);
      }
    }

  } catch (outerErr) {
    console.error('❌ Error fetching users:', outerErr.message);
  }
});
