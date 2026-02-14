// app.js - Project Borahae 最終修復版

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

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'e95-Gaj2iXM', 
        playerVars: { 'autoplay': 0, 'controls': 0, 'playsinline': 1 },
        events: {
            'onReady': () => { isVideoReady = true; console.log("YouTube Player Ready"); },
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateLoop();
    } else if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        showCertificate();
    } else {
        isPlaying = false;
        cancelAnimationFrame(animationFrameId);
    }
}

// 防呆監聽
if (btnStart) {
    btnStart.addEventListener('click', () => {
        if (!isVideoReady) return alert("影片載入中...");
        if (startScreen) startScreen.style.display = 'none';
        if (playScreen) playScreen.style.display = 'flex';
        player.playVideo();
    });
}

function updateLoop() {
    // 解決 songData is not defined 的關鍵檢查
    if (!isPlaying || typeof songData === 'undefined') return; 

    const ytTime = player.getCurrentTime() * 1000;
    const currentTime = ytTime + offset; 
    
    renderSyncTimer(currentTime);

    // 尋找當前應援詞
    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) {
        if (currentLyric.type === 'end') {
            showCertificate();
            isPlaying = false;
            return; 
        }
        render(currentLyric);
    }
    animationFrameId = requestAnimationFrame(updateLoop);
}

function render(lyricObj) {
    if (!lyricBox) return;
    if (lyricObj.type === 'warning') {
        document.body.classList.add('warning-mode');
    } else {
        document.body.classList.remove('warning-mode');
    }

    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = "";
        void lyricBox.offsetWidth;
        lyricBox.classList.add('active');
        if (lyricObj.type === 'chant') lyricBox.classList.add('type-chant');
        lastRenderedText = lyricObj.text;
    }
}

function renderSyncTimer(ms) {
    if (!syncTimer) return;
    let totalSec = Math.floor(ms / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    syncTimer.innerText = `${min}:${sec < 10 ? '0'+sec : sec}`;
}

function showCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'flex';
}

function closeCertificate() {
    const cert = document.getElementById('beta-cert-overlay');
    if (cert) cert.style.display = 'none';
    if (player) player.stopVideo();
    if (playScreen) playScreen.style.display = 'none';
    if (startScreen) startScreen.style.display = 'flex';
}

// 修正 Help Modal 點擊報錯
const helpModal = document.getElementById('help-modal');
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        if (e.target.id === 'help-modal') helpModal.style.display = 'none';
    });
}

function toggleHelp(show) {
    if (helpModal) helpModal.style.display = show ? 'flex' : 'none';
}
