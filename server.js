require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());


const API_KEY = process.env.API_KEY; 

app.get('/haberler', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 30; 

    
        const response = await axios.get(`https://newsapi.org/v2/everything?q=space&pageSize=${pageSize}&page=${page}&apiKey=${API_KEY}`);
        
        res.json(response.data.articles); 
        
    } catch (error) {
        console.error("API Hatası:", error.message);
        res.status(500).json({ hata: "Haberler çekilemedi." });
    }
});

const CMC_KEY = process.env.CMC_API_KEY;

app.get('/piyasa', async (req, res) => {
    try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            params: {
                symbol: 'BTC,ETH,SOL,BNB',
                convert: 'USD'
            },
            headers: {
                'X-CMC_PRO_API_KEY': CMC_KEY // CMC'nin istediği özel güvenlik başlığı
            }
        });

        // CMC verisi biraz derindedir (data -> BTC -> quote -> USD -> price)
        const rawData = response.data.data;
        const result = [
            { symbol: 'BTC', price: rawData.BTC.quote.USD.price },
            { symbol: 'ETH', price: rawData.ETH.quote.USD.price },
            { symbol: 'SOL', price: rawData.SOL.quote.USD.price },
            { symbol: 'BNB', price: rawData.BNB.quote.USD.price }
        ];

        res.json(result);
    } catch (error) {
        console.error("CMC API Hatası:", error.response ? error.response.data : error.message);
        res.status(500).json({ hata: "CoinMarketCap verisi alınamadı." });
    }
});

const COLLECT_KEY = process.env.COLLECT_API_KEY;

app.get('/tr-haberler', async (req, res) => {
    try {
        const response = await axios.get('https://api.collectapi.com/news/getNews', {
            params: {
                country: 'tr',
                tag: 'general'
            },
            headers: {
                'authorization': `apikey ${COLLECT_KEY}`, // CollectAPI bu formatı ister
                'content-type': 'application/json'
            }
        });

        // CollectAPI formatı: { success: true, result: [...] }
        res.json(response.data.result);
    } catch (error) {
        console.error("CollectAPI Hatası:", error.message);
        res.status(500).json({ hata: "Yerel haberler çekilemedi." });
    }
});

app.get('/spor-haberler', async (req, res) => {
    try {
        const response = await axios.get('https://api.collectapi.com/news/getNews', {
            params: { tag: 'sport' }, // Sadece spor haberleri
            headers: {
                'authorization': `apikey ${process.env.COLLECT_API_KEY}`,
                'content-type': 'application/json'
            }
        });
        res.json(response.data.result);
    } catch (error) {
        res.status(500).json({ hata: "Spor haberleri alınamadı." });
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Sunucu ${PORT} portunda yayına hazır!`);
    console.log(`-----------------------------------------`);
});