const express = require('express');
const { Builder, By, Key, until } = require('selenium-webdriver');
const cheerio = require('cheerio');

const app = express();
const port = 3000; // Defina a porta que desejar

// Configuração do servidor e rota para a raspagem
app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.k;

  try {
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(`https://www.amazon.com.br/s?k=${keyword}`);

    // Aguarde até que a página esteja totalmente carregada
    await driver.wait(until.urlContains(`https://www.amazon.com.br/s?k=${keyword}`), 10000);

    // Obtenha o HTML da página após o carregamento completo
    const html = await driver.getPageSource();

    // Use Cheerio para analisar o HTML
    const $ = cheerio.load(html);

    const products = [];

    $('.s-result-item').each((index, element) => {
      const title = $(element).find('.a-text-normal').text().trim();
      const rating = $(element).find('.a-size-medium.a-color-base.a-text-beside-button.a-text-bold').text().trim();
      const numReviews = $(element).find('.a-section.a-spacing-none.a-spacing-top-micro .a-size-base.s-underline-text').text().trim();
      const imageURL = $(element).find('.s-image').attr('src');

      products.push({ title, rating, numReviews, imageURL });
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping Amazon.' });
  } finally {
    // Feche o navegador após a conclusão
    if (driver) {
      await driver.quit();
    }
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});