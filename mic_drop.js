// mic_drop.js - 精準修正版 (再次推遲 +300ms，總計較原始版 +1700ms)
const songData = [
    { "time": 1900, "text": "Waiting for beat...", "type": "wait" },

    // --- 序幕：應援開始 ---
    { "time": 6400, "text": "김.남.준!", "type": "chant" },
    { "time": 7624, "text": "김.석.진!", "type": "chant" },
    { "time": 9049, "text": "민.윤.기!", "type": "chant" },
    { "time": 10450, "text": "정.호.석!", "type": "chant" },
    { "time": 11871, "text": "박.지.민!", "type": "chant" },
    { "time": 13241, "text": "김.태.형!", "type": "chant" },
    { "time": 14686, "text": "전.정.國!", "type": "chant" },
    { "time": 16059, "text": "B.T.S!", "type": "chant" },

    // --- 第二輪應援 ---
    { "time": 17516, "text": "김.남.준!", "type": "chant" },
    { "time": 18905, "text": "김.석.진!", "type": "chant" },
    { "time": 20317, "text": "민.윤.기!", "type": "chant" },
    { "time": 21725, "text": "정.호.석!", "type": "chant" },
    { "time": 23109, "text": "박.지.민!", "type": "chant" },
    { "time": 24504, "text": "김.태.형!", "type": "chant" },
    { "time": 25975, "text": "전.정.國!", "type": "chant" },
    { "time": 27334, "text": "B.T.S!", "type": "chant" },

    // --- 主歌區 (Sing 模式) ---
    { "time": 28900, "text": "scream!", "type": "scream" },
    { "time": 41589, "text": "bang bang", "type": "chant" },
    { "time": 44228, "text": "clap clap", "type": "chant" },
    { "time": 52315, "text": "bungee", "type": "chant" },
  
    // --- 主歌區 ---
    { "time": 53698, "text": "전진", "type": "chant" },
    { "time": 57763, "text": "Billboard", "type": "chant" },
    { "time": 59250, "text": "worldwide", "type": "chant" },
    { "time": 68658, "text": "I do it I do it", "type": "chant" },
    { "time": 70200, "text": "Sue it", "type": "chant" },
  // --- 🚨 預警 (提前 3 秒) ---
    { "time": 71400, "text": "⚠️ INCOMING! ⚠️", "type": "warning" },

    // --- 中段錄製點 ---
  
    { "time": 75160, "text": "(bag)-①", "type": "chant" },
    { "time": 76586, "text": "(bag)-②", "type": "chant" },
    { "time": 78670, "text": "(가득해)", "type": "chant" },
    { "time": 80754, "text": "(that)-①", "type": "chant" },
    { "time": 82206, "text": "(that)-②", "type": "chant" },
    { "time": 84283, "text": "(학을 떼)", "type": "chant" },
    { "time": 87503, "text": "(성공)", "type": "chant" },
    { "time": 90309, "text": "(봉송)", "type": "chant" },
    { "time": 93163, "text": "(숑숑)", "type": "chant" },

    { "time": 96015, "text": "scream!", "type": "scream" },
     // --- 後半段數據 ---
    { "time": 102218, "text": "MIC Drop-①", "type": "chant" },
    { "time": 103641, "text": "MIC Drop-②", "type": "chant" },
    { "time": 105186, "text": "발 발", "type": "chant" },
    { "time": 106546, "text": "말 말", "type": "chant" },
    { "time": 107972, "text": "scream!", "type": "scream" },
    { "time": 112950, "text": "MIC Drop-①", "type": "chant" },
    { "time": 114376, "text": "MIC Drop-②", "type": "chant" }, 
    { "time": 115802, "text": "발 발", "type": "chant" }, 
    { "time": 117228, "text": "말 말", "type": "chant" },
    { "time": 120583, "text": "(자)", "type": "chant" },
    { "time": 121996, "text": "(ah)", "type": "chant" },
    { "time": 126215, "text": "쌔 쌤통", "type": "chant" },
    { "time": 128809, "text": "행복", "type": "chant" },
    { "time": 130235, "text": "scream!", "type": "scream" },
    { "time": 140143, "text": "MIC Drop baam", "type": "chant" },
    { "time": 142571, "text": "(bag)-①", "type": "chant" },
    { "time": 143960, "text": "(bag)-②", "type": "chant" },
    { "time": 146075, "text": "(가득해)", "type": "chant" },
    { "time": 148181, "text": "(that)-①", "type": "chant" },
    { "time": 149589, "text": "(that)-②", "type": "chant" },
    { "time": 151710, "text": "(학을 떼)", "type": "chant" },
    { "time": 154917, "text": "(성공)", "type": "chant" },
    { "time": 157741, "text": "(봉송)", "type": "chant" },
    { "time": 160567, "text": "(숑숑)", "type": "chant" },
    { "time": 161993, "text": "scream!", "type": "scream" },
    { "time": 169614, "text": "MIC Drop-①", "type": "chant" },
    { "time": 171072, "text": "MIC Drop-②", "type": "chant" },
    { "time": 172687, "text": "발 발", "type": "chant" },
    { "time": 173951, "text": "말 말", "type": "chant" },
    { "time": 175377, "text": "scream!", "type": "scream" },
    { "time": 180955, "text": "MIC Drop-①", "type": "chant" },
    { "time": 182351, "text": "MIC Drop-②", "type": "chant" },
    { "time": 183886, "text": "발 발", "type": "chant" },
    { "time": 185287, "text": "말 말", "type": "chant" },
    { "time": 186087, "text": "scream!", "type": "scream" },
    { "time": 201252, "text": "마지막 인사야", "type": "sing" },
    { "time": 206779, "text": "사과도 하지 마", "type": "sing" },
    { "time": 212480, "text": "마지막 인사야", "type": "sing" },
    { "time": 218108, "text": "사과도 하지 마", "type": "sing" },
    { "time": 220610, "text": "잘", "type": "sing" },
    { "time": 221336, "text": "봐", "type": "sing" },
    { "time": 223381, "text": "탁", "type": "sing" },
    { "time": 224111, "text": "쏴", "type": "sing" },
    { "time": 226225, "text": "각", "type": "sing" },
    { "time": 226932, "text": "막", "type": "sing" },
    { "time": 229045, "text": "폼나지-①", "type": "sing" },
    { "time": 230486, "text": "폼나지-②", "type": "sing" },
    { "time": 231912, "text": "scream!", "type": "scream" },


    // --- 🏆 結業證書觸發 ---
    { "time": 240700, "text": "", "type": "end" }

];
