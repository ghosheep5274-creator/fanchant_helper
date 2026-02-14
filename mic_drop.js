// mic_drop.js - 精準修正版 (基準 -400ms，總計較原始版 +1200ms)
const songData = [
    { "time": 1400, "text": "Waiting for beat...", "type": "wait" },

    // --- 序幕：應援開始 ---
    { "time": 5900, "text": "김.남.준!", "type": "chant" },
    { "time": 7124, "text": "김.석.진!", "type": "chant" },
    { "time": 8549, "text": "민.윤.기!", "type": "chant" },
    { "time": 9950, "text": "정.호.석!", "type": "chant" },
    { "time": 11371, "text": "박.지.민!", "type": "chant" },
    { "time": 12741, "text": "김.태.형!", "type": "chant" },
    { "time": 14186, "text": "전.정.국!", "type": "chant" },
    { "time": 15559, "text": "B.T.S!", "type": "chant" },

    // --- 第二輪應援 ---
    { "time": 17016, "text": "김.남.준!", "type": "chant" },
    { "time": 18405, "text": "김.석.진!", "type": "chant" },
    { "time": 19817, "text": "민.윤.기!", "type": "chant" },
    { "time": 21225, "text": "정.호.석!", "type": "chant" },
    { "time": 22609, "text": "박.지.민!", "type": "chant" },
    { "time": 24004, "text": "김.태.형!", "type": "chant" },
    { "time": 25475, "text": "전.정.국!", "type": "chant" },
    { "time": 26834, "text": "B.T.S!", "type": "chant" },

    // --- 主歌區 (Sing 模式) ---
    { "time": 28400, "text": "scream!", "type": "scream" },
    { "time": 41089, "text": "bang bang", "type": "chant" },
    { "time": 43728, "text": "clap clap", "type": "chant" },
    { "time": 51815, "text": "bungee", "type": "chant" },
  
    // --- 主歌區 ---
    { "time": 53198, "text": "전진", "type": "chant" },
    { "time": 57263, "text": "Billboard", "type": "chant" },
    { "time": 58750, "text": "worldwide", "type": "chant" },
    { "time": 68158, "text": "I do it I do it", "type": "chant" },
    { "time": 69700, "text": "Sue it", "type": "chant" },
  // --- 🚨 預警 (提前 3 秒) ---
    { "time": 70900, "text": "⚠️ INCOMING! ⚠️", "type": "warning" },

    // --- 中段錄製點 ---
  
    { "time": 74660, "text": "(bag)-①", "type": "chant" },
    { "time": 76086, "text": "(bag)-②", "type": "chant" },
    { "time": 78170, "text": "(가득해)", "type": "chant" },
    { "time": 80254, "text": "(that)-①", "type": "chant" },
    { "time": 81706, "text": "(that)-②", "type": "chant" },
    { "time": 83783, "text": "(학을 떼)", "type": "chant" },
    { "time": 87003, "text": "(성공)", "type": "chant" },
    { "time": 89809, "text": "(봉송)", "type": "chant" },
    { "time": 92663, "text": "(숑숑)", "type": "chant" },

    { "time": 95515, "text": "scream!", "type": "scream" },
     // --- 後半段數據 ---
    { "time": 101718, "text": "MIC Drop-①", "type": "chant" },
    { "time": 103141, "text": "MIC Drop-②", "type": "chant" },
    { "time": 104686, "text": "발 발", "type": "chant" },
    { "time": 106046, "text": "말 말", "type": "chant" },
    { "time": 107472, "text": "scream!", "type": "scream" },
    { "time": 112450, "text": "MIC Drop-①", "type": "chant" },
    { "time": 113876, "text": "MIC Drop-②", "type": "chant" }, 
    { "time": 115302, "text": "발 발", "type": "chant" }, 
    { "time": 116728, "text": "말 말", "type": "chant" },
    { "time": 120083, "text": "(자)", "type": "chant" },
    { "time": 121496, "text": "(ah)", "type": "chant" },
    { "time": 125715, "text": "쌔 쌤통", "type": "chant" },
    { "time": 128309, "text": "행복", "type": "chant" },
    { "time": 129735, "text": "scream!", "type": "scream" },
    { "time": 139643, "text": "MIC Drop baam", "type": "chant" },
    { "time": 142071, "text": "(bag)-①", "type": "chant" },
    { "time": 143460, "text": "(bag)-②", "type": "chant" },
    { "time": 145575, "text": "(가득해)", "type": "chant" },
    { "time": 147681, "text": "(that)-①", "type": "chant" },
    { "time": 149089, "text": "(that)-②", "type": "chant" },
    { "time": 151210, "text": "(학을 떼)", "type": "chant" },
    { "time": 154417, "text": "(성공)", "type": "chant" },
    { "time": 157241, "text": "(봉송)", "type": "chant" },
    { "time": 160067, "text": "(숑숑)", "type": "chant" },
    { "time": 161493, "text": "scream!", "type": "scream" },
    { "time": 169114, "text": "MIC Drop-①", "type": "chant" },
    { "time": 170572, "text": "MIC Drop-②", "type": "chant" },
    { "time": 172187, "text": "발 발", "type": "chant" },
    { "time": 173451, "text": "말 말", "type": "chant" },
    { "time": 174877, "text": "scream!", "type": "scream" },
    { "time": 180455, "text": "MIC Drop-①", "type": "chant" },
    { "time": 181851, "text": "MIC Drop-②", "type": "chant" },
    { "time": 183386, "text": "발 발", "type": "chant" },
    { "time": 184787, "text": "말 말", "type": "chant" },
    { "time": 185587, "text": "scream!", "type": "scream" },
    { "time": 200752, "text": "마지막 인사야", "type": "sing" },
    { "time": 206279, "text": "사과도 하지 마", "type": "sing" },
    { "time": 211980, "text": "마지막 인사야", "type": "sing" },
    { "time": 217608, "text": "사과도 하지 마", "type": "sing" },
    { "time": 220110, "text": "잘", "type": "sing" },
    { "time": 220836, "text": "봐", "type": "sing" },
    { "time": 222881, "text": "탁", "type": "sing" },
    { "time": 223611, "text": "쏴", "type": "sing" },
    { "time": 225725, "text": "각", "type": "sing" },
    { "time": 226432, "text": "막", "type": "sing" },
    { "time": 228545, "text": "폼나지-①", "type": "sing" },
    { "time": 229986, "text": "폼나지-②", "type": "sing" },
    { "time": 231412, "text": "scream!", "type": "scream" },


    // --- 🏆 結業證書觸發 ---
    { "time": 240200, "text": "", "type": "end" }
];
