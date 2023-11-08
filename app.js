const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Configuração do servidor e rota para a raspagem
app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.keyword;

  try {
    const url = `https://www.amazon.com.br/s?k=${keyword}`;
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);


    const products = [];

    $('.s-result-item__wrap').each((index, element) => {
      const title = $(element).find('.a-size-mini a-spacing-none a-color-base s-line-clamp-4').text().trim();
      const rating = $(element).find('.a-popover-trigger').text().trim();
      const numReviews = $(element).find('.a-size-mini a-color-base puis-light-weight-text').text().trim();
      const imageURL = $(element).find('.s-image').attr('src');

      products.push({ title, rating, numReviews, imageURL });
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping Amazon.' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
