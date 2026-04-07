require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const NEWS_API_KEY = process.env.API_KEY;
const CMC_API_KEY = process.env.CMC_API_KEY;
const COLLECT_API_KEY = process.env.COLLECT_API_KEY;

app.get('/haberler', async (req, res) => {
    const { konu } = req.query;

    try {
       
        let apiTag = 'general'; 
        
        if (konu === 'sport') apiTag = 'sport';     
        if (konu === 'magazine') apiTag = 'magazine';
        if (konu === 'economy') apiTag = 'economy';

        console.log(`📡 Haber isteği alındı: CollectAPI üzerinden '${apiTag}' getiriliyor...`);

        const response = await axios.get('https://api.collectapi.com/news/getNews', {
            params: { country: 'tr', tag: apiTag },
            headers: { 
                'authorization': `apikey ${COLLECT_API_KEY}`,
                'content-type': 'application/json' 
            }
        });
        
        if (response.data && response.data.result) {
       
            const formattedData = response.data.result.map(h => ({
                title: h.name,
                description: h.description,
                urlToImage: h.image,
                url: h.url,
                source: { name: h.source || "Yerel Kaynak" }
            }));

            return res.json(formattedData);
        } else {
    
            return res.json([]);
        }

    } catch (error) {
   
        console.error("❌ CollectAPI Hatası:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            hata: "Haberler şu an yüklenemiyor.",
            servis: "CollectAPI" 
        });
    }
});

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

app.get('/piyasa', async (req, res) => {
    try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            params: { symbol: 'BTC,ETH,SOL,INJ,PAXG,BNB', convert: 'USD' },
            headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY }
        });

        const rawData = response.data.data;
        const result = [
            { symbol: 'BTC', price: rawData.BTC.quote.USD.price },
            { symbol: 'ETH', price: rawData.ETH.quote.USD.price },
            { symbol: 'SOL', price: rawData.SOL.quote.USD.price },
            { symbol: 'INJ', price: rawData.INJ.quote.USD.price },
            { symbol: 'PAXG', price: rawData.PAXG.quote.USD.price },
            { symbol: 'BNB', price: rawData.BNB.quote.USD.price }
        ];
 
        res.json(result); 
    } catch (error) {
        console.error("CMC Hatası:", error.message);
      
        res.json([]); 
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Glober Backend Aktif! Port: ${PORT}`);
});