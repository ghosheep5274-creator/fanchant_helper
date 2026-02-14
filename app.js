// app.js - Project Borahae 視覺特效完全回歸版 (2026.02.14)
// 包含：YouTube 同步 + 完整特效 (🎤/😱/震動) + 防呆機制

let player;
let isVideoReady = false;
let isPlaying = false;
let animationFrameId;
let offset = 0; 
let lastRenderedText = "";

// 抓取元素
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

// [區域 C] 啟動按鈕
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
    if (!isPlaying || !player || typeof songData === 'undefined') return; 
    
    let ytTime = player.getCurrentTime() * 1000;

    // 0秒防呆：避免剛開始撥放時時間跳動異常
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
        // 偵測結束
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
 * [區域 E] 渲染邏輯 (特效修復重點區) 
 * 這裡已經完全還原舊版 logic，包含 Sing/Scream 圖示與 CSS 動畫
 */
function render(lyricObj) {
    if (!lyricBox) return;

    // 1. 警告模式 (紅色閃爍背景)
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

    // 2. 一般歌詞渲染
    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; // 先清空 Class
        void lyricBox.offsetWidth; // 強制瀏覽器重繪 (讓動畫可以重播)
        
        lyricBox.classList.add('active'); // 基礎彈跳動畫
        
        // --- 這裡就是特效消失的原因，現在加回來了 ---
        if (lyricObj.type === 'chant') {
            lyricBox.classList.add('type-chant'); // 紫色發光
            if (navigator.vibrate) navigator.vibrate(50);
        } else if (lyricObj.type === 'sing') {
            lyricBox.classList.add('type-sing', 'icon-sing'); // 青色 + 麥克風🎤
        } else if (lyricObj.type === 'scream') {
            lyricBox.classList.add('type-scream', 'icon-scream'); // 紅色 + 驚恐😱 + 劇烈搖晃
            if (navigator.vibrate) navigator.vibrate([50,30,50]);
        } else if (lyricObj.type === 'wave') {
            lyricBox.classList.add('type-sing', 'icon-wave'); // 手電筒🔦
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
        player.seekTo(0);
    }
    
    isPlaying = false;
    offset = 0;
    lastRenderedText = ""; 
    cancelAnimationFrame(animationFrameId);
    
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
    
    if (navigator.vibrate) navigator.vibrate(50);
}
