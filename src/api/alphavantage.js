import axios from 'axios';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

export async function getNewsSentimentA(tickerA) {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${tickerA}&apikey=${API_KEY}`
    );
    return response.data;
  } catch (err) {
    console.error(
      `Error fetching Alpa Vantage for ${tickerA}: `,
      err
    );
    throw err;
  }
}

export async function getNewsSentimentB(tickerB) {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${tickerB}&apikey=${API_KEY}`
    );
    return response.data;
  } catch (err) {
    console.error(
      `Error fetching Alpa Vantage for ${tickerB}: `,
      err
    );
    throw err;
  }
}
