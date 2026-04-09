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
    
    const eskiHaberler = localStorage.getItem(`cache_${konu}`);


    if (page === 1 && eskiHaberler) {
        console.log("Eski haberler ön yükleme yapılıyor...");
        container.innerHTML = htmlOlustur(JSON.parse(eskiHaberler));
    } else {
        container.innerHTML = `<div style="text-align:center; padding:50px; width:100%;"><p>🚀 Haberler güncelleniyor...</p></div>`;
    }

    try {
        const response = await fetch(`https://glober-hzwh.onrender.com/haberler?konu=${konu}&kaynak=${kaynak}&page=${page}`);
        
        if (!response.ok) throw new Error("Ağ hatası");

        const articles = await response.json();

        if (articles && articles.length > 0) {
         
            localStorage.setItem(`cache_${konu}`, JSON.stringify(articles));
            
            container.innerHTML = htmlOlustur(articles);
            navigasyonuGuncelle();
        } else {
            throw new Error("Boş veri");
        }
    } catch (e) {
        console.error("Haberler getirilemedi, eski veriler kullanılıyor:", e);
        
        if (eskiHaberler) {
            // Hata olsa bile eski haberi tekrar bas (Ekranda "Haber bulunamadı" yazmasın)
            container.innerHTML = htmlOlustur(JSON.parse(eskiHaberler));
           
        } else {
            container.innerHTML = "<p style='text-align:center; width:100%;'>İnternet bağlantınızı kontrol edin.</p>";
        }
    }
}

// Haber kartlarını oluşturan yardımcı fonksiyon (Kod tekrarını önlemek için)
function htmlOlustur(articles) {
    let html = "";
    articles.forEach(art => {
        const resimURL = art.urlToImage || 'https://via.placeholder.com/400x200?text=Haber+Resmi';
        const kaynakAdi = art.source?.name || "Haber Kaynağı";
        html += `
            <div class="news-card">
                <img src="${resimURL}" loading="lazy">
                <div class="news-card-body">
                    <h3>${art.title}</h3>
                    <p>${art.description ? art.description.substring(0, 100) + '...' : 'Açıklama bulunmuyor.'}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <small>📍 ${kaynakAdi}</small>
                        <a href="${art.url}" target="_blank" class="read-more">Habere Git →</a>
                    </div>
                </div>
            </div>`;
    });
    return html;
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

async function sporSliderBaslat(retryCount = 0) {
    const content = document.getElementById('slider-content');
    const maxRetries = 3; 

    try {
        const res = await fetch('https://glober-hzwh.onrender.com/spor-haberler');
        
        if (!res.ok) throw new Error("Sunucu yanıt vermedi");

        const data = await res.json();
        
        if (!data || data.length === 0) {
            content.innerHTML = "<p style='color:white; text-align:center; padding-top:100px;'>Şu an spor haberi bulunamadı.</p>";
            return;
        }

        sporHaberleri = data.slice(0, 10);
        sliderGoster(0);
        dotsOlustur();
        if (window.sliderInterval) clearInterval(window.sliderInterval);
        window.sliderInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % sporHaberleri.length;
            sliderGoster(currentSlide);
        }, 5000);

    } catch (e) {
        console.error(`Slider denemesi ${retryCount + 1} başarısız:`, e);

        if (retryCount < maxRetries) {
            content.innerHTML = `<p style='color:white; text-align:center; padding-top:100px;'>Bağlantı kuruluyor... (Deneme ${retryCount + 1})</p>`;
            
            setTimeout(() => {
                sporSliderBaslat(retryCount + 1);
            }, 3000);
        } else {
            content.innerHTML = `
                <div style='color:white; text-align:center; padding-top:100px;'>
                    <p>Haberler şu an getirilemedi.</p>
                    <button onclick="sporSliderBaslat()" style="background:#4000cb; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-top:10px;">Tekrar Dene</button>
                </div>`;
        }
    }
}
function sliderGoster(index) {
    const content = document.getElementById('slider-content');
    const haber = sporHaberleri[index];
    
    content.innerHTML = `
        <div class="slider-item" style="background-image: url('${haber.image}');">
            <div class="slider-text">
                <span class="badge" style="background:#4000cb; color:white; padding:4px 12px; border-radius:4px; font-size:12px; font-weight:bold;">SPOR</span>
                <h2>${haber.name}</h2>
                <a href="${haber.url}" target="_blank">Habere Git →</a>
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