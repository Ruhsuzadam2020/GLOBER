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

const CRYPTO_API_KEY = process.env.CRYPTO_API_KEY;

app.get('/piyasa', async (req, res) => {
    try {
        const c_key = process.env.CRYPTO_API_KEY;
        
        const response = await axios.get('https://api.freecryptoapi.com/v1/getData', {
            params: {
                symbols: 'BTC,ETH,BNB,SOL', 
                apiKey: c_key
            }
        });
        
        console.log("Gelen Veri:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("API Hatası:", error.message);
        res.status(500).json({ hata: "Veri çekilemedi" });
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Sunucu ${PORT} portunda yayına hazır!`);
    console.log(`-----------------------------------------`);
});