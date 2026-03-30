// --- DEĞİŞKENLER ---
let currentPage = 1;
let currentKonu = 'global+war+economy+sport';
let currentKaynak = 'global';
let sporHaberleri = [];
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    piyasaVerileriniGetir();
    sporSliderBaslat();
    haberleriYukle(currentKonu, currentKaynak, 1); // İlk açılış haberi
});

async function haberleriYukle(konu, kaynak, page = 1) {
    currentKonu = konu;
    currentKaynak = kaynak;
    currentPage = page;

    const container = document.getElementById('news-container');
    container.innerHTML = `
        <div style="text-align:center; padding:50px; width:100%;">
            <p>🚀 ${konu.toUpperCase()} haberleri getiriliyor...</p>
        </div>`;

    try {
        const response = await fetch(`https://glober-hzwh.onrender.com/haberler?konu=${konu}&kaynak=${kaynak}&page=${page}`);
        const articles = await response.json();

        if (articles && articles.length > 0) {
            let html = "";
            articles.forEach(art => {
                html += `
                    <div class="news-card">
                        <img src="${art.urlToImage || 'https://via.placeholder.com/400x200?text=Haber+Resmi'}" style="width:100%; border-radius:8px;">
                        <h3>${art.title}</h3>
                        <p>${art.description ? art.description.substring(0, 120) + '...' : 'Açıklama bulunmuyor.'}</p>
                        <div style="display:flex; justify-content:between; align-items:center; margin-top:10px;">
                            <small>📍 ${art.source.name}</small>
                            <a href="${art.url}" target="_blank" class="read-more">Haberi Oku →</a>
                        </div>
                    </div>`;
            });
            container.innerHTML = html;
            navigasyonuGuncelle();
        } else {
            container.innerHTML = "<p style='text-align:center; width:100%;'>Daha fazla haber bulunamadı.</p>";
        }
    } catch (e) {
        container.innerHTML = "<div class='error-box'>❌ Haberler yüklenirken bir hata oluştu.</div>";
    }
}

// --- 2. SAYFALAMA NAVİGASYONU ---
function navigasyonuGuncelle() {
    let navDiv = document.getElementById('nav-controls');
    if (!navDiv) {
        navDiv = document.createElement('div');
        navDiv.id = 'nav-controls';
        navDiv.className = 'pagination-container';
        document.querySelector('.content').appendChild(navDiv);
    }

    navDiv.innerHTML = `
        <button onclick="sayfaDegistir(-1)" ${currentPage === 1 ? 'disabled' : ''} class="nav-btn">⬅️ Geri</button>
        <span class="page-info">Sayfa ${currentPage}</span>
        <button onclick="sayfaDegistir(1)" class="nav-btn">İleri ➡️</button>
    `;
}

function sayfaDegistir(yon) {
    currentPage += yon;
    if (currentPage < 1) currentPage = 1;
    window.scrollTo({ top: 400, behavior: 'smooth' }); // Slider'ın altına kaydır
    haberleriYukle(currentKonu, currentKaynak, currentPage);
}

// --- 3. SPOR SLIDER SİSTEMİ ---
async function sporSliderBaslat() {
    try {
        const res = await fetch('https://glober-hzwh.onrender.com/spor-haberler');
        sporHaberleri = (await res.json()).slice(0, 5);
        
        if(sporHaberleri.length > 0) {
            sliderGoster(0);
            dotsOlustur();
            setInterval(() => {
                currentSlide = (currentSlide + 1) % sporHaberleri.length;
                sliderGoster(currentSlide);
            }, 4000);
        }
    } catch (e) { console.error("Slider hatası:", e); }
}

function sliderGoster(index) {
    const content = document.getElementById('slider-content');
    const haber = sporHaberleri[index];
    content.innerHTML = `
        <div class="slider-item" style="background: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.9)), url('${haber.image}');">
            <div class="slider-text">
                <span class="badge">SPOR</span>
                <h2>${haber.name}</h2>
                <a href="${haber.url}" target="_blank">Habere Git →</a>
            </div>
        </div>`;
    updateDots(index);
}

function dotsOlustur() {
    const dotsContainer = document.getElementById('slider-dots');
    dotsContainer.innerHTML = "";
    sporHaberleri.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.innerText = i + 1;
        dot.onclick = () => { currentSlide = i; sliderGoster(i); };
        dotsContainer.appendChild(dot);
    });
}

function updateDots(index) {
    const dots = document.getElementById('slider-dots').children;
    for(let i=0; i<dots.length; i++) {
        dots[i].className = (i === index) ? "dot active" : "dot";
    }
}

async function piyasaVerileriniGetir() {
    const ticker = document.getElementById('ticker-content');
    try {
        // Başına her ihtimale karşı yükleniyor yazalım
        ticker.innerHTML = "Piyasa verileri yükleniyor...";

        const response = await fetch('https://glober-hzwh.onrender.com/piyasa');
        const data = await response.json();
        
        // Eğer veri bir liste olarak geldiyse ve boş değilse
        if (Array.isArray(data) && data.length > 0) {
            let content = data.map(coin => 
                ` <span style="color:#f1c40f">●</span> ${coin.symbol}: $${Number(coin.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} `
            ).join(' | ');

            ticker.innerHTML = content + " | " + content + " | " + content;
        } else {
            // Eğer liste boş geldiyse (API hatası) demo veri göster, site boş durmasın
            ticker.innerHTML = "🟡 BTC: $69,120 | 🔵 ETH: $3,450 | 🟣 SOL: $175 | 🟢 BNB: $590";
        }
    } catch (e) { 
        console.error("Borsa Fetch Hatası:", e);
        ticker.innerHTML = "❌ Veri şu an alınamıyor.";
    }
}
