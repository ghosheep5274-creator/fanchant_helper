// app.js - Project Borahae 最終完整版 (視覺特效回歸 + YouTube 同步)
// 特性：保留所有 CSS 動畫、圖示與震動回饋，並修復同步問題。

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

// [介面元素抓取]
const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');

// [區域 A] YouTube API 初始化
function onYouTubeIframeAPIReady() {
    console.log("Loading YouTube API...");
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'e95-Gaj2iXM', 
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': () => { 
                isVideoReady = true; 
                console.log("YouTube Player Ready!");
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

// [區域 B] 狀態監聽
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateLoop();
    } else if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
        showCertificate(); 
    } else {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
    }
}

// [區域 C] 啟動邏輯 (防呆檢查)
if (btnStart) {
    btnStart.addEventListener('click', () => {
        if (!isVideoReady || !player) {
            alert("影片載入中，請稍候...");
            return;
        }

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        }
        
        startScreen.style.display = 'none';
        playScreen.style.display = 'flex';
        
        player.playVideo();
    });
}

function adjustTime(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
}

// [區域 D] 核心循環
function updateLoop() {
    // 檢查 songData 是否存在
    if (!isPlaying || !player || typeof songData === 'undefined') return; 
    
    let ytTime = player.getCurrentTime() * 1000;

    // 0秒防呆
    if (ytTime === 0 && isPlaying) {
        animationFrameId = requestAnimationFrame(updateLoop);
        return;
    }

    const currentTime = ytTime + offset; 
    renderSyncTimer(currentTime);

    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        if (currentLyric.type === 'end') {
            showCertificate();
            isPlaying = false;
            player.pauseVideo();
            return; 
        }
        render(currentLyric);
    }

    animationFrameId = requestAnimationFrame(updateLoop);
}

/**
 * [區域 E] 渲染邏輯 (嚴格還原舊版特效)
 * 這裡恢復了你原始代碼中對 type-sing, icon-sing, icon-scream 的完整判斷
 */
function render(lyricObj) {
    if (!lyricBox) return;

    // 1. 警告模式
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

    // 2. 一般歌詞 (特效回歸重點)
    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; // 重置所有 Class
        void lyricBox.offsetWidth; // 強制瀏覽器重繪 (觸發動畫關鍵)
        
        // 基礎彈跳
        lyricBox.classList.add('active');
        
        // 根據 type 加回原本的視覺特效 Class
        if (lyricObj.type === 'chant') {
            lyricBox.classList.add('type-chant');
            if (navigator.vibrate) navigator.vibrate(50);
        } else if (lyricObj.type === 'sing') {
            // 恢復青色字體與麥克風圖示
            lyricBox.classList.add('type-sing', 'icon-sing');
        } else if (lyricObj.type === 'scream') {
            // 恢復紅色搖晃字體與尖叫圖示
            lyricBox.classList.add('type-scream', 'icon-scream');
            if (navigator.vibrate) navigator.vibrate([50,30,50]);
        } else if (lyricObj.type === 'wave') {
            // 恢復手電筒圖示
            lyricBox.classList.add('type-sing', 'icon-wave');
        }
        
        lastRenderedText = lyricObj.text;
    }
}

// [區域 F] 輔助功能
function renderSyncTimer(ms) {
    if (!syncTimer) return;
    let totalSec = Math.floor(Math.max(0, ms) / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100);
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

// 說明視窗邏輯
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
    
    if (player) {
        player.stopVideo();
        player.seekTo(0); // 回到開頭
    }
    
    isPlaying = false;
    offset = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    
    if (navigator.vibrate) navigator.vibrate(50);
}
