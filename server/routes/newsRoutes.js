const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.get('/latest', async (req, res) => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    const response = await axios.get(
      `https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=10&apikey=${apiKey}`
    );

    const articles = response.data.articles.map(article => ({
      title: article.title,
      summary: article.description || article.content || "No summary available.",
      url: article.url,
      publishedAt: article.publishedAt
    }));

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
