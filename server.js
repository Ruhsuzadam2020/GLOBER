require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // İleride MongoDB için lazım olacak

// API Anahtarları
const NEWS_API_KEY = process.env.API_KEY;
const CMC_API_KEY = process.env.CMC_API_KEY;
const COLLECT_API_KEY = process.env.COLLECT_API_KEY;

// 1. DİNAMİK HABER MERKEZİ (Global, TR, Siyaset, Uzay, Bilim vb.)
app.get('/haberler', async (req, res) => {
    try {
        const { konu, kaynak } = req.query; 

        // TÜRKİYE KAYNAKLI HABERLER (CollectAPI)
        if (kaynak === 'tr') {
            const response = await axios.get('https://api.collectapi.com/news/getNews', {
                params: { country: 'tr', tag: konu || 'general' },
                headers: { 
                    'authorization': `apikey ${COLLECT_API_KEY}`,
                    'content-type': 'application/json'
                }
            });
            
            // Veriyi NewsAPI formatına eşitleyelim (Frontend'de tek tip kod yazmak için)
            const trData = response.data.result.map(h => ({
                title: h.name,
                description: h.description,
                urlToImage: h.image,
                url: h.url,
                source: { name: h.source }
            }));
            return res.json(trData);
        }

        // GLOBAL KAYNAKLI HABERLER (NewsAPI)
        let query = konu || 'global+wars+economy'; 
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`, {
            headers: { 'User-Agent': 'GloberNewsApp/1.0' }
        });
        res.json(response.data.articles);

    } catch (error) {
        console.error("Haber Hatası:", error.message);
        res.status(500).json({ hata: "Haberler yüklenemedi." });
    }
});

// 2. SPOR HABERLERİ (Slider İçin Özel Rota)
app.get('/spor-haberler', async (req, res) => {
    try {
        const response = await axios.get('https://api.collectapi.com/news/getNews', {
            params: { country: 'tr', tag: 'sport' },
            headers: { 'authorization': `apikey ${COLLECT_API_KEY}` }
        });
        res.json(response.data.result);
    } catch (error) {
        res.status(500).json({ hata: "Spor haberleri alınamadı." });
    }
});

// 3. PİYASA VERİLERİ (CoinMarketCap)
app.get('/piyasa', async (req, res) => {
    try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            params: { symbol: 'BTC,ETH,SOL,BNB', convert: 'USD' },
            headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY }
        });

        const rawData = response.data.data;
        const result = [
            { symbol: 'BTC', price: rawData.BTC.quote.USD.price },
            { symbol: 'ETH', price: rawData.ETH.quote.USD.price },
            { symbol: 'SOL', price: rawData.SOL.quote.USD.price },
            { symbol: 'BNB', price: rawData.BNB.quote.USD.price }
        ];
        res.json(result);
    } catch (error) {
        console.error("Borsa Hatası:", error.message);
        res.status(500).json({ hata: "Piyasa verileri alınamadı." });
    }
});

// Sunucu Başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Glober Backend ${PORT} Portunda Aktif!`);
    console.log(`-----------------------------------------`);
});