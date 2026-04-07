let currentPage = 1;
let currentKonu = 'general'; 
let currentKaynak = 'tr';
let sporHaberleri = [];
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    piyasaVerileriniGetir();
    sporSliderBaslat();
    haberleriYukle('general', 'tr', 1); 
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
           
                const resimURL = art.urlToImage || 'https://via.placeholder.com/400x200?text=Haber+Resmi';
                const kaynakAdi = art.source?.name || "Haber Kaynağı";

                html += `
                    <div class="news-card">
                        <img src="${resimURL}" style="width:100%; border-radius:8px;" alt="Haber">
                        <h3>${art.title}</h3>
                        <p>${art.description ? art.description.substring(0, 120) + '...' : 'Açıklama bulunmuyor.'}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                            <small>📍 ${kaynakAdi}</small>
                            <a href="${art.url}" target="_blank" class="read-more">Habere Git →</a>
                        </div>
                    </div>`;
            });
            container.innerHTML = html;
            navigasyonuGuncelle();
        } else {
            container.innerHTML = "<p style='text-align:center; width:100%;'>Bu kategoride haber bulunamadı.</p>";
        }
    } catch (e) {
        console.error("Haber Yükleme Hatası:", e);
        container.innerHTML = "<div class='error-box'>❌ Haberler yüklenirken bir hata oluştu.</div>";
    }
}

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
    
    window.scrollTo({ top: 300, behavior: 'smooth' }); 
    haberleriYukle(currentKonu, currentKaynak, currentPage);
}

async function sporSliderBaslat() {
    const content = document.getElementById('slider-content');
    try {
        const res = await fetch('https://glober-hzwh.onrender.com/spor-haberler');
        const data = await res.json();
        
        if (!data || data.length === 0) {
            content.innerHTML = "<p style='color:white; text-align:center; padding-top:100px;'>Şu an spor haberi bulunamadı.</p>";
            return;
        }

        sporHaberleri = data.slice(0, 10); // İlk 5 haberi al
        
        sliderGoster(0);
        dotsOlustur();

        // Otomatik kaydırma
        setInterval(() => {
            currentSlide = (currentSlide + 1) % sporHaberleri.length;
            sliderGoster(currentSlide);
        }, 5000);

    } catch (e) {
        console.error("Slider yükleme hatası:", e);
        content.innerHTML = "<p style='color:white; text-align:center; padding-top:100px;'>Haberler getirilirken bir sorun oluştu.</p>";
    }
}

function sliderGoster(index) {
    const content = document.getElementById('slider-content');
    const haber = sporHaberleri[index];
    
    // CSS'teki .slider-item yapısına uygun HTML oluşturma
    content.innerHTML = `
        <div class="slider-item" style="background-image: url('${haber.image}');">
            <div class="slider-text">
                <span class="badge" style="background:#4000cb; color:white; padding:5px 10px; border-radius:5px; font-size:12px;">SPOR</span>
                <h2>${haber.name}</h2>
                <a href="${haber.url}" target="_blank">Haberi Oku →</a>
            </div>
        </div>`;
    updateDots(index);
}

function dotsOlustur() {
    const dotsContainer = document.getElementById('slider-dots');
    if(!dotsContainer) return;
    dotsContainer.innerHTML = "";
    sporHaberleri.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = "dot";
        dot.onclick = () => { currentSlide = i; sliderGoster(i); };
        dotsContainer.appendChild(dot);
    });
}

function updateDots(index) {
    const dots = document.getElementById('slider-dots')?.children;
    if(!dots) return;
    for(let i=0; i<dots.length; i++) {
        dots[i].className = (i === index) ? "dot active" : "dot";
    }
}

async function piyasaVerileriniGetir() {
    const ticker = document.getElementById('ticker-content');
    try {
        const [kriptoRes] = await Promise.all([
            fetch('https://glober-hzwh.onrender.com/piyasa').then(r => r.json()).catch(() => [])
        ]);

        let fullContent = "";
  
        if (kriptoRes.length > 0) {
            kriptoRes.forEach(coin => {
                fullContent += ` <span style="color:#00ff00">●</span> ${coin.symbol}: $${Number(coin.price).toLocaleString()} |`;
            });
        }

        ticker.innerHTML = (fullContent + " ").repeat(4);
    } catch (e) {
        ticker.innerHTML = "🔶 Veriler güncelleniyor... | ● BTC: $--- | ● ETH: $---";
    }
}