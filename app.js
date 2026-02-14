// app.js - Project Borahae 雙核心究極版 (2026.02.14)
// 特性：支援「線上影音模式」與「離線純文字模式」切換 + 完整特效

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

// 🆕 新增變數：離線模式專用的起始時間與模式標記
let startTime = 0; 
let useYoutubeMode = true; 

// [介面元素抓取]
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');
const musicToggle = document.getElementById('music-toggle'); // 抓取開關
const modeText = document.getElementById('mode-text');

// [區域 A] 切換開關監聽 (UI互動)
if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
        useYoutubeMode = e.target.checked;
        if (useYoutubeMode) {
            modeText.innerText = "🎵 音樂模式 (需網路)";
            modeText.style.color = "#AB46D2";
        } else {
            modeText.innerText = "🔕 離線模式 (純文字)";
            modeText.style.color = "#aaa";
        }
    });
}

// [區域 B] YouTube API 初始化
function onYouTubeIframeAPIReady() {
    console.log("Loading YouTube API...");
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'e95-Gaj2iXM', 
        playerVars: {
            'autoplay': 0, 'controls': 0, 'disablekb': 1, 'playsinline': 1, 'rel': 0
        },
        events: {
            'onReady': () => { isVideoReady = true; console.log("YouTube Player Ready!"); },
            'onStateChange': onPlayerStateChange
        }
    });
}

// [區域 C] 狀態監聽
function onPlayerStateChange(event) {
    // 防偷跑：如果在首頁，禁止播放
    if (startScreen && startScreen.style.display !== 'none') {
        if (event.data === YT.PlayerState.PLAYING) player.stopVideo();
        return;
    }

    if (useYoutubeMode) {
        if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            updateLoop();
        } else if (event.data === YT.PlayerState.ENDED) {
            finishGame();
        } else {
            isPlaying = false;
            cancelAnimationFrame(animationFrameId);
        }
    }
}

// [區域 D] 啟動邏輯 (雙核心分流)
if (btnStart) {
    btnStart.addEventListener('click', () => {
        
        // 核心分支 1: 音樂模式 (檢查 YouTube)
        if (useYoutubeMode) {
            if (!isVideoReady || !player) {
                alert("YouTube 載入中... 若無網路請切換至「離線模式」");
                return;
            }
            enterPlayScreen();
            player.playVideo(); // 讓 YouTube 驅動 updateLoop
        } 
        
        // 核心分支 2: 離線模式 (使用系統時鐘)
        else {
            enterPlayScreen();
            startTime = Date.now(); // 紀錄現在時間
            isPlaying = true;
            updateLoop(); // 手動啟動循環
        }
    });
}

function enterPlayScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
}

// [區域 E] 核心循環 (雙引擎)
function updateLoop() {
    if (!isPlaying) return;
    
    // 防止資料未載入
    if (typeof songData === 'undefined') return;

    let currentMs = 0;

    // --- 🕒 時間獲取邏輯分流 ---
    if (useYoutubeMode) {
        // 引擎 A: 依賴 YouTube 進度
        if (!player || typeof player.getCurrentTime !== 'function') return;
        currentMs = player.getCurrentTime() * 1000;
        
        // 0秒防呆 (YouTube 剛載入時會回傳 0)
        if (currentMs === 0) {
            animationFrameId = requestAnimationFrame(updateLoop);
            return;
        }
    } else {
        // 引擎 B: 依賴系統時間 (離線)
        currentMs = Date.now() - startTime;
    }

    // 計算最終時間 (加上手動微調)
    const currentTime = currentMs + offset; 
    renderSyncTimer(currentTime);

    // 比對歌詞
    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        if (currentLyric.type === 'end') {
            finishGame();
            return; 
        }
        render(currentLyric);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
}

// [區域 F] 渲染邏輯 (特效保留)
function render(lyricObj) {
    if (!lyricBox) return;

    // 警告模式
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

    // 一般歌詞
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

// [區域 G] 輔助與結束功能
function finishGame() {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    if (useYoutubeMode && player) player.pauseVideo();
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

// 動態建立提示框元件
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

const helpModal = document.getElementById('help-modal');
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        if (e.target.id === 'help-modal') toggleHelp(false);
    });
}

function toggleHelp(show) {
    if (helpModal) helpModal.style.display = show ? 'flex' : 'none';
}

function closeCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'none';
    
    // 切換回首頁
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';

    // 停止影片 (如果有的話)
    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo(); 
    }
    
    isPlaying = false;
    offset = 0;
    startTime = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    if (navigator.vibrate) navigator.vibrate(50);
}
