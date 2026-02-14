// app.js - 多歌曲結構化版 (2026.02.14)

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

let startTime = 0; 
let useYoutubeMode = true; 
let pauseStartTime = 0;

// 🆕 新增：當前選中的歌曲資料
let currentSongData = []; 
let currentSongId = "mic_drop"; 

// [介面元素抓取]
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');
const musicToggle = document.getElementById('music-toggle'); 
const modeText = document.getElementById('mode-text');
const btnPause = document.getElementById('btn-pause');
const songSelect = document.getElementById('song-select'); // 抓取選單

// [區域 A] 切換開關監聽
if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
        useYoutubeMode = e.target.checked;
        modeText.innerText = useYoutubeMode ? "🎵 音樂模式 (需網路)" : "🔕 離線模式 (純文字)";
        modeText.style.color = useYoutubeMode ? "#AB46D2" : "#aaa";
    });
}

// [區域 B] YouTube API 初始化
function onYouTubeIframeAPIReady() {
    // 預設先載入 Mic Drop，但之後會根據選擇切換
    player = new YT.Player('player', {
        height: '0', width: '0', videoId: 'e95-Gaj2iXM', 
        playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'playsinline': 1, 'rel': 0 },
        events: {
            'onReady': () => { isVideoReady = true; console.log("YouTube Ready"); },
            'onStateChange': onPlayerStateChange
        }
    });
}

// [區域 C] 狀態監聽
function onPlayerStateChange(event) {
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

// [區域 D] 啟動與載入邏輯 (關鍵修改)
if (btnStart) {
    btnStart.addEventListener('click', () => {
        // 1. 讀取使用者選了哪首歌
        const selectedValue = songSelect ? songSelect.value : "mic_drop";
        loadSong(selectedValue);

        if (useYoutubeMode) {
            if (!isVideoReady || !player) {
                alert("YouTube 載入中...");
                return;
            }
            enterPlayScreen();
            player.playVideo();
        } else {
            enterPlayScreen();
            startTime = Date.now(); 
            isPlaying = true;
            updatePauseButton(true);
            updateLoop();
        }
    });
}

// 🆕 載入歌曲函式
function loadSong(songKey) {
    // 從資料庫抓資料
    const song = songLibrary[songKey];
    if (!song) {
        alert("資料庫錯誤：找不到歌曲 " + songKey);
        return;
    }

    // 1. 設定歌詞數據
    currentSongData = song.data;
    currentSongId = songKey;

    // 2. 設定 YouTube 影片 (如果是不同首才載入)
    if (player && typeof player.loadVideoById === 'function') {
        // 如果現在 player 裡的 ID 跟我要的不一樣，就載入新的
        // 注意：這裡簡化處理，直接 loadVideoById 會自動重頭載入
        player.loadVideoById(song.videoId);
    }

    // 3. 設定愛心 BPM 速度 (修改 CSS 變數或樣式)
    const heart = document.getElementById('metronome-icon');
    if (heart && song.bpm) {
        // 計算動畫週期：60秒 / BPM (例如 60/85 = 0.7秒)
        // 因為是左右搖擺，可能需要微調倍率，這裡假設 CSS 是單次擺動
        const duration = (60 / song.bpm) + "s";
        heart.style.animationDuration = duration;
        console.log(`BPM set to ${song.bpm}, duration: ${duration}`);
    }
}

function enterPlayScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
}

// [區域 E] 核心循環 (改用 currentSongData)
function updateLoop() {
    if (!isPlaying) return;
    if (!currentSongData) return; // 防呆

    let currentMs = 0;

    if (useYoutubeMode) {
        if (!player || typeof player.getCurrentTime !== 'function') return;
        currentMs = player.getCurrentTime() * 1000;
        if (currentMs === 0) {
            animationFrameId = requestAnimationFrame(updateLoop);
            return;
        }
    } else {
        currentMs = Date.now() - startTime;
    }

    const currentTime = currentMs + offset; 
    renderSyncTimer(currentTime);

    // 🔴 改用 currentSongData
    const currentLyric = currentSongData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, currentSongData[0]);

    if (currentLyric) {
        if (currentLyric.type === 'end') {
            finishGame();
            return; 
        }
        render(currentLyric);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
}

// [區域 F] 渲染邏輯 (維持不變)
function render(lyricObj) {
    if (!lyricBox) return;
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
        void lyricBox.offsetWidth; 
        lyricBox.classList.add('active');
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

// [區域 G] 結束邏輯 (紀錄該首歌的次數)
function finishGame() {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    if (useYoutubeMode && player) player.pauseVideo();
    
    // 🔴 針對特定歌曲儲存次數 (例如 mic_drop_count)
    const storageKey = `${currentSongId}_count`;
    let count = parseInt(localStorage.getItem(storageKey) || '0');
    count++;
    localStorage.setItem(storageKey, count);
    
    const toast = document.querySelector('.toast');
    if (toast) {
        if (count < 3) {
            toast.innerText = `🔥 特訓進度: ${count}/3`;
        } else {
            toast.innerText = `🏆 恭喜！${currentSongId} 已達成目標！`;
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
    showCertificate();
}


function renderSyncTimer(ms) {
    if (!syncTimer) return;
    if (ms < 0) ms = 0;
    
    let totalSec = Math.floor(ms / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100); 
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);
let toastTimeout;

window.adjustTime = function(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
    const sign = offset > 0 ? '+' : '';
    toast.innerText = `校正: ${sign}${offset}ms`;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 1000);
};

function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

// 1. 綁定說明視窗的關閉點擊 (點背景關閉)
const helpModal = document.getElementById('help-modal');
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        // 只有點擊黑色背景時才關閉，點擊卡片本身不關閉
        if (e.target.id === 'help-modal') window.toggleHelp(false);
    });
}

// 2. 🔴 關鍵修復：強制掛載到 window，讓 HTML 按鈕能呼叫
window.toggleHelp = function(show) {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        
        // 加一點動畫效果
        if (show && navigator.vibrate) navigator.vibrate(20);
    } else {
        console.error("找不到 help-modal 元素，請檢查 index.html");
    }
};

function closeCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'none';

    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';

    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo(); 
    }
    
    isPlaying = false;
    offset = 0;
    startTime = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    updatePauseButton(false); // 重置按鈕狀態
    
    if (navigator.vibrate) navigator.vibrate(50);
}




