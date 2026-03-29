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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Sunucu ${PORT} portunda yayına hazır!`);
    console.log(`-----------------------------------------`);
});