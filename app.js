// app.js - Project Borahae 最終整合版 (2026.02.15)
// 包含：自動選單生成、歌詞預載、雙模式切換、防呆機制

let lyricsCache = {}; // 存放預載歌詞
let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

let startTime = 0; 
let useYoutubeMode = false; 
let pauseStartTime = 0;

let currentSongData = []; 
let currentSongId = "mic_drop"; // 預設值

// [區域 A] 介面元素抓取
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');
const musicToggle = document.getElementById('music-toggle'); 
const modeText = document.getElementById('mode-text');
const btnPause = document.getElementById('btn-pause');
const songSelect = document.getElementById('song-select');

// [區域 B] 初始化邏輯 (自動選單 & 預載)

// 1. 自動渲染歌曲選單
function renderSongSelect() {
    if (!songSelect || typeof songLibrary === 'undefined') return;

    songSelect.innerHTML = ""; // 清空

    // 產生選項
    Object.entries(songLibrary).forEach(([id, data]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = data.title;
        songSelect.appendChild(option);
    });

    // 讀取上次選擇
    const lastPicked = localStorage.getItem('last_picked_song');
    if (lastPicked && songLibrary[lastPicked]) {
        songSelect.value = lastPicked;
        currentSongId = lastPicked;
    } else {
        // 如果沒有紀錄，就用選單的第一個
        currentSongId = songSelect.value;
    }
    console.log("選單初始化完成，目前選擇:", currentSongId);
}

// 2. 自動預載所有歌詞
async function preloadAllLyrics() {
    console.log("開始預載所有歌曲歌詞...");
    if (typeof songLibrary === 'undefined') return;

    const songKeys = Object.keys(songLibrary);
    await Promise.all(songKeys.map(async (key) => {
        try {
            const song = songLibrary[key];
            const response = await fetch(song.file + '?t=' + Date.now());
            if (response.ok) {
                lyricsCache[key] = await response.json();
                console.log(`✅ ${key} 預載完成`);
            }
        } catch (e) {
            console.error(`❌ ${key} 預載失敗:`, e);
        }
    }));
    console.log("歌詞預載作業結束。");
}

// 頁面載入時執行初始化
window.addEventListener('DOMContentLoaded', () => {
    initEffects(); // 👈 加入這行，建立夕陽背景層
    renderSongSelect();
    preloadAllLyrics();
});

// 監聽選單改變
if (songSelect) {
    songSelect.addEventListener('change', (e) => {
        currentSongId = e.target.value;
        localStorage.setItem('last_picked_song', currentSongId);
        console.log("切換歌曲至:", currentSongId);
    });
}

// 將純粹的「特效切換」抽離，不干擾歌詞文字處理
const effectCommands = {
    'sakura_start': () => startSakura(),
    'sakura_stop': () => stopSakura(),
    'sunset_start': () => showSunset(),
    'sunset_stop': () => hideSunset(),
    'ember_start': () => startEmbers(),
    'ember_stop': () => stopEmbers(),
    'firework_start': () => startFireworks(),
    'firework_stop': () => stopFireworks(),
    'city_1': () => setCityStage(1),
    'city_2': () => setCityStage(2),
    'city_off': () => setCityStage(0),
    'magic_1': () => setMagicStage(1),
    'magic_2': () => setMagicStage(2),
    'magic_3': () => setMagicStage(3),
    'magic_off': () => setMagicStage(0),
    'butter_start': () => startButter(),
    'butter_end': () => stopButter(),
    'dynamite_start': () =>startDynamite(),
    'dynamite_end': () =>stopDynamite(),
    'purpleballoons_1': () =>startPurpleBalloons(1),
    'purpleballoons_2': () =>startPurpleBalloons(2),
    'purpleballoons_stop': () =>stopPurpleBalloons(),
    'ptdbackground_start': () =>startPTDBackground(),
    'ptdbackground_stop': () =>stopPTDBackground(),
    // --- 🌊 新增深海指令 ---
    'deep_sea_start': () => startDeepSea(),
    'deep_sea_stop': () => stopDeepSea()
};


// [區域 C] 模式切換邏輯
if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
        let currentProgress = 0;
        
        // 1. 計算當前進度
        if (useYoutubeMode) {
            if (player && typeof player.getCurrentTime === 'function') {
                currentProgress = player.getCurrentTime() * 1000;
            } else {
                currentProgress = Date.now() - startTime - offset;
            }
        } else {
            currentProgress = Date.now() - startTime;
        }

        // 2. 切換狀態
        useYoutubeMode = e.target.checked; 

        // 3. 更新 UI
        if (modeText) {
            modeText.innerText = "🎵 音樂模式";
            modeText.style.color = useYoutubeMode ? "#AB46D2" : "#888"; 
        }

        // 4. 重置時間基準
        if (useYoutubeMode) {
            if (player && typeof player.seekTo === 'function') {
                player.seekTo(currentProgress / 1000, true);
                if (isPlaying) player.playVideo();
            }
        } else {
            startTime = Date.now() - currentProgress;
        }
    });
}

// [區域 D] YouTube API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0', width: '0', videoId: 'e95-Gaj2iXM', 
        playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'playsinline': 1, 'rel': 0 },
        events: {
            'onReady': () => { isVideoReady = true; console.log("YouTube Ready"); },
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    // 如果還在首頁就偷跑，強制停止
    if (startScreen && startScreen.style.display !== 'none') {
        if (event.data === YT.PlayerState.PLAYING) player.stopVideo();
        return;
    }
    
    if (useYoutubeMode) {
        if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            updatePauseButton(true);
            updateLoop();
        } else if (event.data === YT.PlayerState.PAUSED) {
            isPlaying = false;
            updatePauseButton(false);
            cancelAnimationFrame(animationFrameId);
        } else if (event.data === YT.PlayerState.ENDED) {
            finishGame();
        }
    }
}

// [區域 E] 遊戲啟動 (Start Game)
if (btnStart) {
    btnStart.addEventListener('click', async () => {
        // 確保 currentSongId 有值
        const targetSong = songSelect ? songSelect.value : currentSongId;
        const loaded = await loadSong(targetSong);
        if (!loaded) return;

        if (useYoutubeMode) {
            if (!isVideoReady || !player) {
                alert("YouTube 載入中，請稍後再試...");
                return;
            }
            enterPlayScreen();
            player.playVideo();
        } else {
            if (player && typeof player.stopVideo === 'function') player.stopVideo();
            enterPlayScreen();
            startTime = Date.now(); 
            isPlaying = true;
            updatePauseButton(true);
            updateLoop();
        }
    });
}

async function loadSong(songKey) {
    const song = songLibrary[songKey];
    if (!song) {
        alert("找不到歌曲資料：" + songKey);
        return false;
    }
    currentSongId = songKey;
    
    // 優先從快取讀取
    if (lyricsCache[songKey]) {
        currentSongData = lyricsCache[songKey];
        console.log(`🚀 從記憶體讀取 ${songKey}`);
    } else {
        try {
            const response = await fetch(song.file + '?t=' + Date.now());
            currentSongData = await response.json();
            lyricsCache[songKey] = currentSongData;
        } catch (e) {
            alert("歌詞載入失敗，請檢查網路。");
            return false;
        }
    }
    
    // 設定 YouTube 影片
    if (player && typeof player.cueVideoById === 'function') {
        player.cueVideoById(song.videoId);
    }
    
    // 設定心跳 BPM
    const heart = document.getElementById('metronome-icon');
    if (heart && song.bpm) {
        const duration = (60 / song.bpm) + "s";
        heart.style.animationDuration = duration;
    }
    return true;
}

function enterPlayScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
}

// [區域 F] 核心循環 (Game Loop)
function updateLoop() {
    if (!isPlaying) return;
    
    let currentMs = useYoutubeMode ? (player.getCurrentTime() * 1000) : (Date.now() - startTime);
    
    // YouTube 有時候剛開始會回傳 0，若是 0 則繼續跑 loop 等待
    if (useYoutubeMode && currentMs === 0) {
        animationFrameId = requestAnimationFrame(updateLoop);
        return;
    }
    
    const currentTime = currentMs + offset; 
    renderSyncTimer(currentTime);
    
    const currentLyric = currentSongData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, currentSongData[0]);
    
    if (currentLyric) {
        if (currentLyric.type === 'end') { finishGame(); return; }
        render(currentLyric);
    }
    
    animationFrameId = requestAnimationFrame(updateLoop);
}

// [區域 G] 渲染 (Render)
function render(lyricObj) {
    if (!lyricBox) return;

// 🌸 修改處：使用字典快速比對指令，若匹配成功則執行並跳出
    if (effectCommands[lyricObj.type]) {
        effectCommands[lyricObj.type]();
        return; // 這是特效指令，不處理後面的歌詞邏輯
    }
    
    // 處理特殊 Type 樣式
    if (lyricObj.type === 'warning') {
        document.body.classList.add('warning-mode');
        if (lastRenderedText !== lyricObj.text) {
             lyricBox.innerText = lyricObj.text;
             lyricBox.className = "type-scream"; 
             lastRenderedText = lyricObj.text;
        }
        return; 
    } else {
        document.body.classList.remove('warning-mode');
    }

    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; 
        void lyricBox.offsetWidth; // 觸發重繪 (Reflow) 以重啟動畫
        lyricBox.classList.add('active');
        
        // 根據 Type 加 class
        if (lyricObj.type === 'chant') {
            lyricBox.classList.add('type-chant');
            if (navigator.vibrate) navigator.vibrate(50);
        } else if (lyricObj.type === 'sing') {
            lyricBox.classList.add('type-sing', 'icon-sing');
        } else if (lyricObj.type === 'scream') {
            lyricBox.classList.add('type-scream', 'icon-scream');
            if (navigator.vibrate) navigator.vibrate([50,30,50]);
        } else if (lyricObj.type === 'wave') {
            lyricBox.classList.add('type-sing', 'icon-wave');
        }
        
        lastRenderedText = lyricObj.text;
    }
}

// [區域 H] 控制與輔助函式

// 暫停/繼續
window.togglePlay = function() {
    if (isPlaying) {
        isPlaying = false;
        updatePauseButton(false);
        cancelAnimationFrame(animationFrameId);
        if (useYoutubeMode && player) player.pauseVideo();
        else pauseStartTime = Date.now();
    } else {
        isPlaying = true;
        updatePauseButton(true);
        if (useYoutubeMode && player) player.playVideo();
        else { startTime += (Date.now() - pauseStartTime); updateLoop(); }
    }
};

// 返回首頁
window.returnToHome = function() {
    if (confirm("確定要回到首頁嗎？目前的練習將不會計次。")) {
        resetToTitle();
    }
};

// 更新暫停按鈕外觀
function updatePauseButton(active) {
    if (btnPause) {
        btnPause.innerText = active ? "⏸ 暫停" : "▶️ 繼續";
        btnPause.style.background = active ? "rgba(171, 70, 210, 0.3)" : "#AB46D2";
        btnPause.style.animation = active ? "none" : "pulse 1.5s infinite";
    }
    const heart = document.getElementById('metronome-icon');
    if (heart) {
        if (active) heart.classList.remove('paused-animation');
        else heart.classList.add('paused-animation');
    }
}

// 微調時間
window.adjustTime = function(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
    const toast = document.querySelector('.toast') || createToast();
    toast.innerText = `校正: ${offset > 0 ? '+' : ''}${offset}ms`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1000);
};

function createToast() {
    const t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
    return t;
}

// 顯示/隱藏說明
window.toggleHelp = function(show) {
    const modal = document.getElementById('help-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

// 遊戲結束邏輯
function finishGame() {
    console.log("Game Finished"); 
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    
    if (useYoutubeMode && player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }

    // 增加計數
    const key = `${currentSongId}_count`;
    let count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, count);
    console.log(`Song ${currentSongId} count: ${count}`);

    //🌸 新增：歌曲結束時停止生成 (舊的讓它飄完很美)
    stopSakura();
    clearAllEffects(); // 👈 歌曲結束也清空
    clearCityEffects(); // 💖 新增這行
    clearMagicEffects();  // 🔴 補上這行：清除魔法星空
    clearButterEffects();
    clearDynamiteEffects();
    clearBalloonsEffects();
    clearPTDBackgroundEffects();
    clearDeepSeaEffects();
    
    
    // 延遲後回首頁
    setTimeout(() => {
        resetToTitle(); 
    }, 1800); 
}

// 重置回首頁
function resetToTitle() {
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    
    isPlaying = false;
    offset = 0;
    startTime = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }
    clearSakura();
    clearAllEffects(); // 👈 改用這個大掃除函式
    clearCityEffects(); // 💖 新增這行
    clearMagicEffects(); // 🔴 補上這行：清除魔法星空
    clearButterEffects();
    clearDynamiteEffects();
    clearBalloonsEffects();
    clearPTDBackgroundEffects();
    clearDeepSeaEffects();
    updatePauseButton(false);
}

// 渲染計時器
function renderSyncTimer(ms) {
    if (!syncTimer) return;
    let totalSec = Math.floor(Math.max(0, ms) / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100); 
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}


// ===========================
// [區域 I] 特效引擎 (Sakura, Sunset, Embers)
// ===========================

let sakuraInterval = null;

// 啟動櫻花
function startSakura() {
    if (sakuraInterval) return; // 避免重複啟動
    console.log("🌸 櫻花季開始");
    
    // 每 300毫秒 產生一片花瓣 (數字越小花越密)
    sakuraInterval = setInterval(createPetal, 600);
}

// 停止櫻花 (停止生成，舊的讓它飄完)
function stopSakura() {
    if (sakuraInterval) {
        clearInterval(sakuraInterval);
        sakuraInterval = null;
        console.log("🌸 櫻花季結束");
    }
}

// 強制清除所有花瓣 (回首頁時用)
function clearSakura() {
    stopSakura();
    document.querySelectorAll('.sakura-petal').forEach(el => el.remove());
}

// 產生單片花瓣
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');
    
    // 隨機屬性
    const size = Math.random() * 10 + 5 + 'px'; // 大小 5~15px
    const left = Math.random() * 100 + 'vw'; // 水平位置 0~100%
    const duration = Math.random() * 5 + 8 + 's'; // 飄落時間 4~7秒 (慢一點比較溫柔)
    const delay = Math.random() * 2 + 's'; // 隨機延遲

    petal.style.width = size;
    petal.style.height = size;
    petal.style.left = left;
    petal.style.animationDuration = duration;
    // petal.style.animationDelay = delay; // 不需要延遲，直接下比較順
    
    // 偶爾出現深粉紅
    if (Math.random() > 0.8) {
        petal.style.backgroundColor = '#ffb7b2'; 
    }

    document.body.appendChild(petal);

    // 動畫結束後自我銷毀，避免記憶體洩漏
    setTimeout(() => {
        petal.remove();
    }, parseFloat(duration) * 1000);
}



// --- 通用初始化 (在 window.onload 呼叫) ---
function initEffects() {
    // 如果還沒有夕陽層，就建立一個
    if (!document.getElementById('sunset-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'sunset-overlay';
        // 把它插在 body 的最前面，確保在文字後面
        document.body.insertBefore(overlay, document.body.firstChild);
    }
}
// 記得在下面的 window.addEventListener('DOMContentLoaded', ...) 裡呼叫 initEffects();


// --- 🔥 Sunset + Embers (I Need U) ---
let emberInterval = null;

// 啟動夕陽
function showSunset() {
    const overlay = document.getElementById('sunset-overlay');
    if (overlay) overlay.classList.add('active');
    console.log("🌅 夕陽漸層啟動");
}

// 關閉夕陽
function hideSunset() {
    const overlay = document.getElementById('sunset-overlay');
    if (overlay) overlay.classList.remove('active');
    console.log("🌃 回歸黑夜");
}

// 啟動火星
function startEmbers() {
    if (emberInterval) return;
    console.log("🔥 餘燼開始燃燒");
    // 頻率：每 320ms 產生一顆 (密集一點比較有燃燒感)
    emberInterval = setInterval(createEmber, 320);
}

// 停止火星生成
function stopEmbers() {
    if (emberInterval) {
        clearInterval(emberInterval);
        emberInterval = null;
        console.log("🔥 餘燼熄滅");
    }
}

// 清除所有特效 (回首頁用)
function clearAllEffects() {
    // 停止生成器
    stopSakura(); // 如果有櫻花
    stopEmbers(); // 如果有火星
    hideSunset(); // 關閉夕陽

    // 移除畫面上的殘留粒子
    document.querySelectorAll('.sakura-petal').forEach(el => el.remove());
    document.querySelectorAll('.ember-particle').forEach(el => el.remove());
}

// 產生單顆火星
function createEmber() {
    const ember = document.createElement('div');
    ember.classList.add('ember-particle');
    
    // 隨機屬性
    const size = Math.random() * 5 + 2 + 'px'; // 大小 2~7px
    const left = Math.random() * 100 + 'vw'; // 水平位置
    const duration = Math.random() * 4 + 5 + 's'; // 飄升速度 3~7秒
    const drift = (Math.random() * 150 - 75) + 'px'; // 左右大幅飄移 (-75px ~ 75px)

    ember.style.width = size;
    ember.style.height = size;
    ember.style.left = left;
    ember.style.animationDuration = duration;
    ember.style.setProperty('--drift', drift);

    document.body.appendChild(ember);

    setTimeout(() => { ember.remove(); }, parseFloat(duration) * 1000);
}

// ===========================
// 💖 Boy With Luv Engine
// ===========================

let fireworkInterval = null;

// 初始化城市 (造房子)
// app.js - [區域 I] 特效引擎

function initCity() {
    if (document.getElementById('bwl-city')) return;

    const cityContainer = document.createElement('div');
    cityContainer.id = 'bwl-city';
    
    const overlay = document.createElement('div');
    overlay.id = 'bwl-overlay';

    document.body.insertBefore(cityContainer, document.body.firstChild);
    document.body.insertBefore(overlay, document.body.firstChild);

    // 🏗️ 生成約 15 棟建築
    for (let i = 0; i < 15; i++) {
        const b = document.createElement('div');
        b.classList.add('building');
        
        // 房屋外觀設定
        b.style.height = (Math.random() * 25 + 15) + 'vh'; 
        b.style.width = (Math.random() * 6 + 8) + '%';
        
        // --- 🪟 窗戶生成邏輯 (樓層 + 欄位版) ---
        
        // 1. 定義樓層：從 5% 高度開始，每隔 8% 一層，蓋到 90%
        for (let topPos = 5; topPos < 90; topPos += 8) {
            
            // 2. 定義欄位：每層樓有 3 個橫向位置 (左、中、右)
            // 0=左, 1=中, 2=右
            for (let col = 0; col < 3; col++) {
                
                // 3. 隨機決定這個位置要不要亮燈 (30% 機率亮燈)
                // 這樣就會有「有的樓層亮2盞、有的亮1盞」的錯落感
                if (Math.random() > 0.7) { 
                    const w = document.createElement('div');
                    w.classList.add('city-window');
                    
                    // 🔴 寬度變窄：固定為建築寬度的 20% (原本是 30%~60%)
                    w.style.width = '20%';
                    
                    // 🔴 水平並排：依據欄位決定位置 (左10%, 中40%, 右70%)
                    w.style.left = (col * 30 + 10) + '%';
                    
                    w.style.top = topPos + '%';
                    
                    b.appendChild(w);
                }
            }
        }

        cityContainer.appendChild(b);
    }
}

// 設定舞台階段 (0=關閉, 1=朦朧, 2=霓虹)
function setCityStage(stage) {
    initCity(); // 確保城市存在
    
    // 清除舊狀態
    document.body.classList.remove('city-stage-1', 'city-stage-2');

    if (stage === 1) {
        document.body.classList.add('city-stage-1');
        console.log("🏙️ 城市：朦朧模式");
    } else if (stage === 2) {
        document.body.classList.add('city-stage-2');
        console.log("🌆 城市：霓虹全開");
    } else {
        console.log("🌃 城市：關燈");
    }
}

// --- 煙火系統 ---
function startFireworks() {
    if (fireworkInterval) return;
    console.log("🎆 煙火秀開始！");
    // 每 500ms 放一顆煙火
    fireworkInterval = setInterval(createFirework, 500);
}

function stopFireworks() {
    if (fireworkInterval) {
        clearInterval(fireworkInterval);
        fireworkInterval = null;
    }
}

// 產生一顆煙火 (包含爆炸出的 20 顆粒子)
function createFirework() {
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * (window.innerHeight * 0.6); // 只在上半部爆炸
    
    // 隨機顏色：粉紅、金、紫、青
    const colors = ['#FF69B4', '#FFD700', '#8A2BE2', '#00FFFF'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // 產生 20 個粒子向四面八方炸開
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.classList.add('firework-particle');
        p.style.backgroundColor = color;
        p.style.left = startX + 'px';
        p.style.top = startY + 'px';
        
        // 計算爆炸方向 (三角函數)
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50; // 爆炸半徑
        const tx = Math.cos(angle) * velocity + 'px';
        const ty = Math.sin(angle) * velocity + 'px';
        
        p.style.setProperty('--tx', tx);
        p.style.setProperty('--ty', ty);
        
        document.body.appendChild(p);
        
        // 動畫結束後移除
        setTimeout(() => p.remove(), 1000);
    }
}

// 清除所有 BWL 特效
function clearCityEffects() {
    setCityStage(0); // 關燈
    stopFireworks();
    // 移除殘留粒子
    document.querySelectorAll('.firework-particle').forEach(el => el.remove());
}


// ===========================
// 🔮 Magic Shop Engine
// ===========================

let meteorInterval = null;

// 初始化魔法天空 (灑星星)
function initMagicSky() {
    if (document.getElementById('magic-sky')) return;

    const sky = document.createElement('div');
    sky.id = 'magic-sky';
    document.body.insertBefore(sky, document.body.firstChild);

    // ✨ 產生 50 顆星星 (數量少一點，效能比較好)
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.classList.add('magic-star');
        
        // 隨機大小 (1px ~ 3px)
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        // 隨機位置
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 80 + '%'; // 不要太下面，留給舞台

        // 隨機動畫延遲 (讓閃爍不同步，看起來才自然)
        star.style.animationDelay = (Math.random() * 2) + 's';

        sky.appendChild(star);
    }
}

// 設定魔法階段
function setMagicStage(stage) {
    initMagicSky();
    
    // 1. 移除所有狀態 class (這會觸發 CSS 的淡出)
    document.body.classList.remove('magic-stage-1', 'magic-stage-2', 'magic-stage-3');
    
    // 2. 停止生成新流星
    stopMeteors(); 

    // 🔴 3. 強力清場：馬上移除畫面上所有殘留的流星 (修正卡住問題)
    const existingMeteors = document.querySelectorAll('.shooting-star');
    existingMeteors.forEach(m => m.remove());

    if (stage === 1) {
        document.body.classList.add('magic-stage-1');
        console.log("🔮 Magic: 深淵夜空");
    } else if (stage === 2) {
        document.body.classList.add('magic-stage-1', 'magic-stage-2');
        console.log("🔮 Magic: 銀河閃爍");
    } else if (stage === 3) {
        document.body.classList.add('magic-stage-1', 'magic-stage-2');
        startMeteors();
        console.log("🔮 Magic: 流星雨");
    } else {
        // stage 為 0 或 magic_off 時
        console.log("🔮 Magic: 全關 (OFF)");
    }
}

// --- 流星系統 ---
function startMeteors() {
    if (meteorInterval) return;
    // 每 1.5 秒丟一顆流星 (不要太頻繁，避免卡頓)
    meteorInterval = setInterval(createMeteor, 1000);
}

function stopMeteors() {
    if (meteorInterval) {
        clearInterval(meteorInterval);
        meteorInterval = null;
    }
}

function createMeteor() {
    const sky = document.getElementById('magic-sky');
    if (!sky) return;

    const meteor = document.createElement('div');
    meteor.classList.add('shooting-star');
    
    // 從天頂隨機位置出發
    // left: -20% ~ 120% (範圍大一點，讓流星可以從畫面外劃進來)
    meteor.style.left = (Math.random() * 140 - 20) + '%';
    meteor.style.top = (Math.random() * 50 - 20) + '%'; // 從上方落下

    sky.appendChild(meteor);

    // 動畫結束後 (2秒) 移除元素
    setTimeout(() => {
        meteor.remove();
    }, 2000);
}

// 清除所有 Magic 特效
function clearMagicEffects() {
    setMagicStage(0);
    stopMeteors();
}



// ===========================
// 🧈 Butter Melt Engine
// ===========================

function initButterMelt() {
    if (document.getElementById('butter-wrapper')) return;

    // 1. 注入「手機專用」輕量化濾鏡
    const svgFilter = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filter-container">
      <defs>
        <filter id="butter-mobile-filter" color-interpolation-filters="sRGB"
                x="-50%" y="-50%" width="200%" height="200%">
          
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="gooey" />

          <feComposite in="SourceGraphic" in2="gooey" operator="atop"/>
        </filter>
      </defs>
    </svg>`;
    document.body.insertAdjacentHTML('beforeend', svgFilter);

    const wrapper = document.createElement('div');
    wrapper.id = 'butter-wrapper';

    // 2. 建立頂部波浪
    const topWave = document.createElement('div');
    topWave.innerHTML = `
        <svg class="butter-svg-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <defs>
                <linearGradient id="butter-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#FFC107;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path fill="url(#butter-gradient)" d="M0,0 L1440,0 L1440,100 
            C1350,180 1250,80 1150,140 
            C1050,200 950,280 850,220 
            C750,160 650,220 550,260 
            C400,320 300,150 200,200 
            C100,250 50,150 0,120 Z"></path>
        </svg>
    `;
    wrapper.appendChild(topWave);

    // 3. 建立水滴 (固定 3 顆)
    const dropPositions = [10, 33, 65]; 
    dropPositions.forEach(pos => { createDrop(wrapper, pos); });

    document.body.insertBefore(wrapper, document.body.firstChild);
}

function createDrop(wrapper, leftPos) {
    const drop = document.createElement('div');
    drop.classList.add('butter-drop');
    
    // 尺寸維持縮小版 (18~28px)
    const size = Math.random() * 10 + 18;
    drop.style.width = size + 'px';
    drop.style.height = (size * 1.3) + 'px';
    drop.style.left = leftPos + '%';
    
    const duration = Math.random() * 1.5 + 3.5; 
    drop.style.animationDuration = duration + 's';
    drop.style.animationDelay = (Math.random() * -4) + 's';

    wrapper.appendChild(drop);
}


// 開始特效
function startButter() {
    initButterMelt();
    // 使用 setTimeout 確保 transition 能觸發
    setTimeout(() => {
        document.body.classList.add('butter-on');
        console.log("🧈 Butter: 融化開始");
    }, 10);
}

// 停止特效
function stopButter() {
    document.body.classList.remove('butter-on');
    console.log("🧈 Butter: 融化結束");
}

// 清除特效 (用於 finishGame)
function clearButterEffects() {
    stopButter();
    // 如果需要完全移除元素可以寫在這裡，但通常只需要 stop 即可
}




// app.js - Dynamite 特效引擎

let dynamiteInterval;

function startDynamite() {
    if (document.getElementById('dynamite-confetti-layer')) return;

    // 1. 建立背景與亮片層
    const bgLayer = document.createElement('div');
    bgLayer.id = 'dynamite-bg-layer';
    document.body.appendChild(bgLayer);

    const confettiLayer = document.createElement('div');
    confettiLayer.id = 'dynamite-confetti-layer';
    document.body.appendChild(confettiLayer);

    // 2. 背景色彩循環 (Dynamite 配色)
    const colors = ['#FF9AA2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];
    let colorIdx = 0;
    
    // 啟動背景色循環與亮片生成
    dynamiteInterval = setInterval(() => {
        // 更新背景色
        bgLayer.style.background = colors[colorIdx];
        colorIdx = (colorIdx + 1) % colors.length;

        // 每次生成 3~5 片碎紙花
        for (let i = 0; i < 5; i++) {
            createConfetti(confettiLayer);
        }
    }, 1000);
}

function createConfetti(container) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    
    // 隨機顏色 (粉、黃、藍、綠、紫)
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#D67BFF'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // 隨機形狀
    const shapes = ['square', 'circle', 'star'];
    confetti.classList.add(shapes[Math.floor(Math.random() * shapes.length)]);
    
    // 隨機位置與大小
    confetti.style.left = Math.random() * 100 + '%';
    const size = Math.random() * 10 + 8 + 'px';
    confetti.style.width = size;
    confetti.style.height = size;
    
    // 隨機速度 (3s ~ 6s)
    confetti.style.animationDuration = Math.random() * 3 + 3 + 's';
    
    container.appendChild(confetti);

    // 動畫結束後移除
    confetti.addEventListener('animationend', () => confetti.remove());
}

function stopDynamite() {
    clearInterval(dynamiteInterval);
    document.getElementById('dynamite-bg-layer')?.remove();
    document.getElementById('dynamite-confetti-layer')?.remove();
}

// 清除特效 (用於 finishGame)
function clearDynamiteEffects() {
    stopDynamite();
    // 如果需要完全移除元素可以寫在這裡，但通常只需要 stop 即可
}



// app.js - [區域 I] 特效引擎

let balloonInterval;
let balloonLayer;
let currentBalloonStage = 0; // 0:停止, 1:序幕, 2:慶典

// 啟動氣球特效 (輸入階段 1 或 2)
function startPurpleBalloons(stage) {
    if (currentBalloonStage === stage) return; // 如果已經是當前階段就不重複執行
    currentBalloonStage = stage;

    // 確保容器存在
    if (!document.getElementById('purple-balloon-layer')) {
        balloonLayer = document.createElement('div');
        balloonLayer.id = 'purple-balloon-layer';
        document.body.appendChild(balloonLayer);
    }

    // 清除舊的計時器
    if (balloonInterval) clearInterval(balloonInterval);

    console.log(`[Effect] 紫色氣球啟動: 階段 ${stage}`);

    // 根據階段設定生成頻率
    // 階段 1 (序幕): 較慢，每 800ms 一顆
    // 階段 2 (慶典): 密集，每 250ms 一顆
    const intervalTime = stage === 1 ? 800 : 250;

    balloonInterval = setInterval(() => {
        createBalloon(stage);
    }, intervalTime);
}

// 停止特效
function stopPurpleBalloons() {
    if (balloonInterval) {
        clearInterval(balloonInterval);
        balloonInterval = null;
    }
    currentBalloonStage = 0;
    // 可選擇是否要立刻移除所有氣球，或者讓它們自然飄完
    // document.getElementById('purple-balloon-layer')?.remove(); 
    console.log('[Effect] 紫色氣球停止');
}

// 建立單顆氣球的核心函式
function createBalloon(stage) {
    if (!balloonLayer) return;

    const balloon = document.createElement('div');
    balloon.classList.add('balloon');

    // 1. 隨機顏色深淺 (1~3)
    const shade = Math.floor(Math.random() * 3) + 1;
    balloon.classList.add(`shade-${shade}`);

    // 2. 根據階段設定參數
    let size, duration;
    if (stage === 1) {
        // 階段 1: 較小，較慢
        size = Math.random() * 20 + 30; // 30px ~ 50px
        duration = Math.random() * 4 + 8; // 8s ~ 12s (飄很慢)
    } else {
        // 階段 2: 較大，較快
        size = Math.random() * 30 + 40; // 40px ~ 70px (加入大氣球)
        duration = Math.random() * 3 + 5; // 5s ~ 8s (飄比較快)
    }

    // 3. 設定 CSS 變數給動畫使用
    balloon.style.setProperty('--size', `${size}px`);
    balloon.style.setProperty('--duration', `${duration}s`);
    balloon.style.setProperty('--delay', `${Math.random() * 2}s`); // 隨機延遲出發

    // 隨機起始 X 位置 (0% ~ 100%)
    balloon.style.left = `${Math.random() * 100}%`;

    // 隨機左右飄移量 (-100px ~ 100px)
    const driftX = Math.random() * 200 - 100;
    balloon.style.setProperty('--drift-x', `${driftX}px`);

    // 隨機輕微旋轉 (-30deg ~ 30deg)
    const rot = Math.random() * 60 - 30;
    balloon.style.setProperty('--rot', `${rot}deg`);

    // 4. 加入畫面
    balloonLayer.appendChild(balloon);

    // 5. 動畫結束後移除元素 (重要！防止手機卡頓)
    // 這裡用一個比動畫時間稍長的 timeout 來移除
    setTimeout(() => {
        balloon.remove();
    }, (duration + 2) * 1000); 
}


// --- PTD 背景色彩循環模組 ---
let ptdBgInterval;

function startPTDBackground() {
    // 防止重複建立
    if (document.getElementById('ptd-bg-layer')) return;

    const bgLayer = document.createElement('div');
    bgLayer.id = 'ptd-bg-layer';
    document.body.appendChild(bgLayer); // 插入到 body 最底層

    // 定義馬卡龍色票 (Dynamite Palette)
    const colors = [
        '#FF9AA2', // 柔粉
        '#FFDAC1', // 蜜桃
        '#E2F0CB', // 嫩綠
        '#B5EAD7', // 薄荷
        '#C7CEEA'  // 薰衣草
    ];
    let colorIdx = 0;

    // 啟動循環 (每 4 秒換一次色，配合 CSS 的 3s 轉場)
    ptdBgInterval = setInterval(() => {
        colorIdx = (colorIdx + 1) % colors.length;
        bgLayer.style.backgroundColor = colors[colorIdx];
    }, 4000);
}

function stopPTDBackground() {
    if (ptdBgInterval) {
        clearInterval(ptdBgInterval);
        ptdBgInterval = null;
    }
    const bgLayer = document.getElementById('ptd-bg-layer');
    if (bgLayer) {
        // 淡出效果 (選擇性)
        bgLayer.style.opacity = '0';
        setTimeout(() => bgLayer.remove(), 1000);
    }
}

// 清除特效 (用於 finishGame)
function clearBalloonsEffects() {
    stopPurpleBalloons();
    // 如果需要完全移除元素可以寫在這裡，但通常只需要 stop 即可
}

// 清除特效 (用於 finishGame)
function clearPTDBackgroundEffects() {
    stopPTDBackground();
    // 如果需要完全移除元素可以寫在這裡，但通常只需要 stop 即可
}


// ===========================
// 🌊 Deep Sea Mode Engine
// ===========================

// 初始化深海層
function initDeepSea() {
    if (document.getElementById('deep-sea-layer')) return;

    const seaLayer = document.createElement('div');
    seaLayer.id = 'deep-sea-layer';
    
    // 加上水面亮紋子元素
    const surface = document.createElement('div');
    surface.className = 'sea-surface';
    seaLayer.appendChild(surface);
    
    document.body.insertBefore(seaLayer, document.body.firstChild);
}

// 啟動深海特效
function startDeepSea() {
    initDeepSea();
    const sea = document.getElementById('deep-sea-layer');
    if (sea) {
        sea.style.display = 'block'; // 先顯示
        setTimeout(() => sea.classList.add('active'), 50); // 再淡入
    }
}

// 停止與清除 (這部分保持跟之前建議的一樣即可，但要確保 resetToTitle 有呼叫到)
function stopDeepSea() {
    const sea = document.getElementById('deep-sea-layer');
    if (sea) {
        sea.classList.remove('active');
        setTimeout(() => { 
            if(!sea.classList.contains('active')) sea.style.display = 'none'; 
        }, 2000);
    }
}

// 強制清除深海特效 (回首頁或切換歌曲時用)
function clearDeepSeaEffects() {
    stopDeepSea();
    // 如果需要完全移除元素可以解鎖下面這行，但通常淡出即可
    // setTimeout(() => document.getElementById('deep-sea-layer')?.remove(), 2000); 
}


