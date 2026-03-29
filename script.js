let currentPage = 1; 

/**
 * 
 * @param {number} pageNumber 
 */
async function haberleriGetir(pageNumber = 1) {
    const container = document.getElementById('news-container');
    
    container.innerHTML = `
        <div style="text-align:center; padding:50px;">
            <p>🚀 Haberler getiriliyor, lütfen bekleyin...</p>
        </div>`;

    try {
        console.log(`${pageNumber}. sayfa verisi isteniyor...`);

        const response = await fetch(`https://glober-hzwh.onrender.com/haberler?page=${pageNumber}`);
        const articles = await response.json();

        if (articles && articles.length > 0) {
            let haberKartlari = "";

            articles.forEach(haber => {
                haberKartlari += `
                    <div class="news-card" style="border:1px solid #ddd; margin:15px 0; padding:20px; border-radius:10px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3 style="color:#2c3e50; margin-top:0; line-height:1.4;">${haber.title}</h3>
                        <p style="color:#7f8c8d; font-size:0.85rem;">
                            <strong>Kaynak:</strong> ${haber.source.name} | 
                            <strong>Tarih:</strong> ${new Date(haber.publishedAt).toLocaleDateString('tr-TR')}
                        </p>
                        <p style="font-size: 1rem; color: #333; line-height:1.6;">${haber.description || 'Bu haber için kısa açıklama bulunmuyor.'}</p>
                        <a href="${haber.url}" target="_blank" style="display:inline-block; margin-top:10px; color:#e67e22; text-decoration:none; font-weight:bold; border:1px solid #e67e22; padding:5px 15px; border-radius:5px;">Haberi Oku →</a>
                    </div>
                `;
            });

            container.innerHTML = haberKartlari;
            navigasyonuGoster();
            
        } else {
            container.innerHTML = "<p style='text-align:center;'>Daha fazla haber bulunamadı.</p>";
        }

    } catch (error) {
        console.error("Bağlantı Hatası:", error);
        container.innerHTML = `
            <div style="color:red; text-align:center; padding:20px; border:2px dashed red;">
                <h4>Sunucuya Ulaşılamadı!</h4>
                <p>Lütfen terminalde <b>node server.js</b> komutunun çalıştığından emin olun.</p>
            </div>`;
    }
}
async function yerelHaberleriGetir() {
    const container = document.getElementById('news-container');
    try {
        const response = await fetch('https://glober-hzwh.onrender.com/tr-haberler');
        const articles = await response.json();
        
        let haberKartlari = "";
        articles.forEach(haber => {
            haberKartlari += `
                <div class="news-card">
                    <img src="${haber.image}" style="width:100%; border-radius:10px;">
                    <h3>${haber.name}</h3>
                    <p>${haber.description}</p>
                    <a href="${haber.url}" target="_blank">Devamını Oku</a>
                </div>`;
        });
        container.innerHTML = haberKartlari;
    } catch (error) {
        console.error("Hata:", error);
    }
}
async function piyasaVerileriniGetir() {
    const ticker = document.getElementById('ticker-content');
    try {
        const response = await fetch('https://glober-hzwh.onrender.com/piyasa');
        const data = await response.json();
        
        let content = data.map(coin => 
            ` 🟡 ${coin.symbol}: $${coin.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} `
        ).join(' | ');

        ticker.innerHTML = content + " | " + content;
    } catch (error) {
        ticker.innerHTML = "❌ CoinMarketCap verisi bekleniyor...";
    }
}

let currentSlide = 0;
let sporHaberleri = [];

async function sporSliderBaslat() {
    try {
        const res = await fetch('https://glober-hzwh.onrender.com/spor-haberler');
        sporHaberleri = await res.json();
        
        // Sadece ilk 5 haberi alalım ki çok kalabalık olmasın
        sporHaberleri = sporHaberleri.slice(0, 5);
        
        sliderGoster(0);
        dotsOlustur();
        
        // 3 saniyede bir otomatik kaydır
        setInterval(() => {
            currentSlide = (currentSlide + 1) % sporHaberleri.length;
            sliderGoster(currentSlide);
        }, 3000);
        
    } catch (e) { console.error("Slider hatası:", e); }
}

function sliderGoster(index) {
    const content = document.getElementById('slider-content');
    const haber = sporHaberleri[index];
    
    content.innerHTML = `
        <div style="background: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.8)), url('${haber.image}'); height: 350px; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 40px; color: white;">
            <div style="text-align: left;">
                <span style="background: #e74c3c; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold;">SON DAKİKA SPOR</span>
                <h2 style="margin-top: 10px; font-size: 24px;">${haber.name}</h2>
                <a href="${haber.url}" target="_blank" style="color: #3498db; text-decoration: none; font-weight: bold;">Habere Git →</a>
            </div>
        </div>
    `;
    updateDots(index);
}

function dotsOlustur() {
    const dotsContainer = document.getElementById('slider-dots');
    sporHaberleri.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.innerText = i + 1; // 1-2-3-4 şeklinde görünür
        dot.style = "width: 30px; height: 30px; border-radius: 50%; border: none; background: rgba(255,255,255,0.5); cursor: pointer; font-weight: bold;";
        dot.onclick = () => { currentSlide = i; sliderGoster(i); };
        dotsContainer.appendChild(dot);
    });
}

function updateDots(index) {
    const dots = document.getElementById('slider-dots').children;
    for(let i=0; i<dots.length; i++) {
        dots[i].style.background = (i === index) ? "#fff" : "rgba(255,255,255,0.5)";
        dots[i].style.color = (i === index) ? "#000" : "#fff";
    }
}

// Başlatmayı unutma!
document.addEventListener('DOMContentLoaded', sporSliderBaslat);

// Sayfa açıldığında çalıştır
document.addEventListener('DOMContentLoaded', () => {
    piyasaVerileriniGetir();
    haberleriGetir(1); // Mevcut haber fonksiyonun
});

/**
 * Sayfanın altına 'İleri' ve 'Geri' butonlarını ekleyen fonksiyon
 */
function navigasyonuGoster() {
    let navDiv = document.getElementById('nav-controls');
    
    if (!navDiv) {
        navDiv = document.createElement('div');
        navDiv.id = 'nav-controls';
        navDiv.style.textAlign = 'center';
        navDiv.style.padding = '30px 0';
        document.querySelector('.content').appendChild(navDiv);
    }

    navDiv.innerHTML = `
        <button onclick="sayfaDegistir(-1)" ${currentPage === 1 ? 'disabled' : ''} 
            style="padding:10px 25px; margin-right:10px; cursor:pointer; background:#2c3e50; color:white; border:none; border-radius:5px; opacity: ${currentPage === 1 ? '0.5' : '1'}">
            ⬅️ Geri
        </button>
        
        <span style="font-size:1.2rem; font-weight:bold; margin:0 10px;">Sayfa ${currentPage}</span>
        
        <button onclick="sayfaDegistir(1)" 
            style="padding:10px 25px; margin-left:10px; cursor:pointer; background:#2c3e50; color:white; border:none; border-radius:5px;">
            İleri ➡️
        </button>
    `;
}

/**
 
 * @param {number} yon - İleri için +1, geri için -1
 */
function sayfaDegistir(yon) {
    currentPage += yon;
    if (currentPage < 1) currentPage = 1;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    haberleriGetir(currentPage);
}
document.addEventListener('DOMContentLoaded', () => {
    haberleriGetir(currentPage);
});