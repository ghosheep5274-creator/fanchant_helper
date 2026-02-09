// mic_drop.js - V1.0 封測版數據

const songData = [
    // --- 開場準備 ---
    { "time": 0, "text": "Waiting for beat...", "type": "wait" },
    
    // --- 第一輪應援 (保持 Chant) ---
    { "time": 4600, "text": "Kim Nam Jun!", "type": "chant" },
    { "time": 6057, "text": "Kim Seok Jin!", "type": "chant" },
    { "time": 7514, "text": "Min Yun Ki!", "type": "chant" },
    { "time": 8971, "text": "Jeong Ho Seok!", "type": "chant" },
    { "time": 10428, "text": "Park Ji Min!", "type": "chant" },
    { "time": 11885, "text": "Kim Tae Hyung!", "type": "chant" },
    { "time": 13342, "text": "Jeon Jung Kook!", "type": "chant" },
    { "time": 14799, "text": "BTS!!", "type": "chant" },

    // --- 第二輪應援 ---
    { "time": 16256, "text": "Kim Nam Jun!", "type": "chant" },
    { "time": 17713, "text": "Kim Seok Jin!", "type": "chant" },
    { "time": 19170, "text": "Min Yun Ki!", "type": "chant" },
    { "time": 20627, "text": "Jeong Ho Seok!", "type": "chant" },
    { "time": 22084, "text": "Park Ji Min!", "type": "chant" },
    { "time": 23541, "text": "Kim Tae Hyung!", "type": "chant" },
    { "time": 24998, "text": "Jeon Jung Kook!", "type": "chant" },
    { "time": 26455, "text": "BTS!!", "type": "chant" },

    // --- 主歌與過場 (改成 Sing 模式) ---
    // 這裡用青色字體，提示粉絲這是聽歌時間
    { "time": 28000, "text": "🎵 Yeah... who says my spoon is dirty?", "type": "sing" },
    { "time": 35000, "text": "Somebody stop me...", "type": "sing" },

    // --- 🚨 戰術動作：Bang Bang 前的紅色警戒 ---
    // 在 40325 前約 3 秒啟動警告
    { "time": 37500, "text": "⚠️ INCOMING! ⚠️", "type": "warning" },
    { "time": 39000, "text": "READY...", "type": "warning" },

    // --- 💥 副歌高潮區 💥 ---
    { "time": 40325, "text": "Bang! Bang!", "type": "chant" },
    
    // 這裡原本是 'lyric'，我幫妳改成重點尖叫位
    { "time": 41300, "text": "Did you see my bag?!", "type": "scream" },
    
    { "time": 43239, "text": "Crap! Crap!", "type": "chant" },
    
    // 中間的歌詞過場
    { "time": 44300, "text": "Haters gon' hate...", "type": "sing" },
    { "time": 47300, "text": "Players gon' play...", "type": "sing" },

    // --- 🎯 精準狙擊點 ---
    { "time": 51253, "text": "Bungee!", "type": "chant" },
    { "time": 52710, "text": "Chunging!", "type": "chant" },

    // --- 結尾高潮 ---
    { "time": 60424, "text": "Miyane Oma!", "type": "chant" },
    
    // ... (假設後面還有很多歌詞) ...
    
    // --- 🏆 歌曲結束 (觸發封測證書) ---
    // 時間設在歌曲真正的結束點 (這裡假設是 65秒，妳可以改成實際秒數)
    { "time": 65000, "text": "", "type": "end" }
];