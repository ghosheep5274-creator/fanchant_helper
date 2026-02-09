// app.js - 核心邏輯

let startTime = 0;
let currentTime = 0;
let isPlaying = false;
let animationFrameId;
let offset = 0;

const startScreen = document.getElementById('start-screen');
const playScreen = document.getElementById('play-screen');
const lyricBox = document.getElementById('lyric-box');
const syncTimer = document.getElementById('sync-timer');
const btnStart = document.getElementById('btn-start');

btnStart.addEventListener('click', () => {
    // 嘗試全螢幕
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    startScreen.style.display = 'none';
    playScreen.style.display = 'flex';
    
    startTime = Date.now();
    isPlaying = true;
    updateLoop();
});

function adjustTime(ms) {
    offset += ms;
    if (navigator.vibrate) navigator.vibrate(20);
}

function updateLoop() {
    if (!isPlaying) return;

    currentTime = Date.now() - startTime + offset;
    renderSyncTimer(currentTime);

    // 尋找當前歌詞 (依賴 mic_drop.js 裡的 songData)
    // 這裡使用簡單邏輯：找到最後一個「時間到了」的詞
    const currentLyric = songData.reduce((prev, curr) => {
        return (curr.time <= currentTime) ? curr : prev;
    }, songData[0]);

    if (currentLyric) render(currentLyric);

    animationFrameId = requestAnimationFrame(updateLoop);
}

function renderSyncTimer(ms) {
    if (ms < 0) ms = 0;
    let totalSec = Math.floor(ms / 1000);
    let min = Math.floor(totalSec / 60);
    let sec = totalSec % 60;
    let deci = Math.floor((ms % 1000) / 100);
    syncTimer.innerText = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}.${deci}`;
}

let lastRenderedText = "";

function render(lyricObj) {
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

    // 2. 一般歌詞
    if (lastRenderedText !== lyricObj.text) {
        lyricBox.innerText = lyricObj.text;
        lyricBox.className = ""; // 重置
        void lyricBox.offsetWidth; // 強制重繪
        
        // 加入特效 Class
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
// app.js 最下面加入

// 控制說明視窗開關
function toggleHelp(show) {
    const modal = document.getElementById('help-modal');
    if (show) {
        modal.style.display = 'flex'; // 用 flex 才能置中
    } else {
        modal.style.display = 'none';
    }
}

// 點擊視窗外部也可以關閉 (優化體驗)
document.getElementById('help-modal').addEventListener('click', (e) => {
    if (e.target.id === 'help-modal') {
        toggleHelp(false);
    }
});