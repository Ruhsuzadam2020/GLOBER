require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// API Anahtarları
const NEWS_API_KEY = process.env.API_KEY;
const CMC_API_KEY = process.env.CMC_API_KEY;
const COLLECT_API_KEY = process.env.COLLECT_API_KEY;

app.get('/haberler', async (req, res) => {
    const { konu, kaynak } = req.query;

    try {
        // TR kaynaklı isteklerde veya 'sport' konusunda CollectAPI'ye git
        if (kaynak === 'tr' || konu === 'sport' || konu === 'magazine') {
            
            // API'nin anladığı tag isimlerine çeviriyoruz
            let apiTag = 'general'; 
            if (konu === 'sport') apiTag = 'sport';     
            if (konu === 'magazine') apiTag = 'magazine';
            if (konu === 'economy') apiTag = 'economy';

            console.log(`CollectAPI isteği atılıyor: Tag -> ${apiTag}`); // Loglardan kontrol et

            const response = await axios.get('https://api.collectapi.com/news/getNews', {
                params: { country: 'tr', tag: apiTag },
                headers: { 'authorization': `apikey ${COLLECT_API_KEY}` }
            });
            
            if (response.data && response.data.result) {
                const trData = response.data.result.map(h => ({
                    title: h.name,
                    description: h.description,
                    urlToImage: h.image,
                    url: h.url,
                    source: { name: h.source || "Yerel Kaynak" }
                }));
                return res.json(trData);
            }
        }

        // --- SENARYO B: Global Haber İstekleri (NewsAPI) ---
        try {
            let query = konu || 'global+wars+economy'; 
            const response = await axios.get(`https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`, {
                headers: { 'User-Agent': 'GloberNewsApp/1.0' }
            });
            return res.json(response.data.articles);

        } catch (newsError) {
            // NewsAPI Kotası Dolduysa (429) veya Hata Verirse (426) BURASI ÇALIŞIR:
            console.log("NewsAPI Hatası (Muhtemelen Kota), CollectAPI'ye geçiliyor...");
            
            const backupResponse = await axios.get('https://api.collectapi.com/news/getNews', {
                params: { country: 'tr', tag: 'general' },
                headers: { 'authorization': `apikey ${COLLECT_API_KEY}` }
            });

            const backupData = backupResponse.data.result.map(h => ({
                title: h.name + " (Gündem)",
                description: h.description,
                urlToImage: h.image,
                url: h.url,
                source: { name: h.source }
            }));
            return res.json(backupData);
        }

    } catch (error) {
        console.error("Genel Haber Hatası:", error.message);
        res.status(500).json({ hata: "Haberler şu an yüklenemiyor." });
    }
});

// 2. SPOR HABERLERİ (CollectAPI)
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
        // Başarılı olduğunda sadece listeyi dön
        res.json(result); 
    } catch (error) {
        console.error("CMC Hatası:", error.message);
        // Hata olsa bile frontend çökmesin diye boş liste dönelim
        res.json([]); 
    }
});

app.get('/altin', async (req, res) => {
    try {
        const response = await axios.get('https://api.collectapi.com/economy/goldPrice', {
            headers: { 'authorization': `apikey ${COLLECT_API_KEY}` }
        });
        
        // Sadece işimize yarayacak olanları (Gram, Çeyrek, Ons) seçip gönderelim
        const altinVerileri = response.data.result.filter(a => 
            ['Gram Altın', 'Çeyrek Altın', 'ONS'].includes(a.name)
        ).map(a => ({
            name: a.name,
            price: a.sell // Satış fiyatını baz alalım
        }));

        res.json(altinVerileri);
    } catch (error) {
        console.error("Altın API Hatası:", error.message);
        res.json([]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Glober Backend Aktif! Port: ${PORT}`);
});