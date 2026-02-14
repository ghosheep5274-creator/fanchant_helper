// mic_drop.js - 精準修正版 (+700ms 修正)
const songData = [
    { "time": 900, "text": "Waiting for beat...", "type": "wait" },

    // --- 序幕：應援開始 ---
    { "time": 5400, "text": "김.남.준!", "type": "chant" },
    { "time": 6624, "text": "김.석.진!", "type": "chant" },
    { "time": 8049, "text": "민.윤.기!", "type": "chant" },
    { "time": 9450, "text": "정.호.석!", "type": "chant" },
    { "time": 10871, "text": "박.지.min!", "type": "chant" },
    { "time": 12241, "text": "김.태.형!", "type": "chant" },
    { "time": 13686, "text": "전.정.국!", "type": "chant" },
    { "time": 15059, "text": "B.T.S!", "type": "chant" },

    // --- 第二輪應援 ---
    { "time": 16516, "text": "김.남.준!", "type": "chant" },
    { "time": 17905, "text": "김.석.진!", "type": "chant" },
    { "time": 19317, "text": "민.윤.기!", "type": "chant" },
    { "time": 20725, "text": "정.호.석!", "type": "chant" },
    { "time": 22109, "text": "박.지.min!", "type": "chant" },
    { "time": 23504, "text": "김.태.형!", "type": "chant" },
    { "time": 24975, "text": "전.정.국!", "type": "chant" },
    { "time": 26334, "text": "B.T.S!", "type": "chant" },

    // --- 主歌區 (Sing 模式) ---
    { "time": 27900, "text": "scream!", "type": "scream" },
    { "time": 40589, "text": "bang bang", "type": "chant" },
    { "time": 43228, "text": "clap clap", "type": "chant" },
    { "time": 51315, "text": "bungee", "type": "chant" },
  
    // --- 主歌區 ---
    { "time": 52698, "text": "전진", "type": "chant" },
    { "time": 56763, "text": "Billboard", "type": "chant" },
    { "time": 58250, "text": "worldwide", "type": "chant" },
    { "time": 67658, "text": "I do it I do it", "type": "chant" },
    { "time": 69200, "text": "Sue it", "type": "chant" },
  // --- 🚨 預警 (提前 3 秒) ---
    { "time": 70400, "text": "⚠️ INCOMING! ⚠️", "type": "warning" },

    // --- 中段錄製點 ---
  
    { "time": 74160, "text": "(bag)-①", "type": "chant" },
    { "time": 75586, "text": "(bag)-②", "type": "chant" },
    { "time": 77670, "text": "(가득해)", "type": "chant" },
    { "time": 79754, "text": "(that)-①", "type": "chant" },
    { "time": 81206, "text": "(that)-②", "type": "chant" },
    { "time": 83283, "text": "(학을 떼)", "type": "chant" },
    { "time": 86503, "text": "(성공)", "type": "chant" },
    { "time": 89309, "text": "(봉송)", "type": "chant" },
    { "time": 92163, "text": "(숑숑)", "type": "chant" },

    { "time": 95015, "text": "scream!", "type": "scream" },
     // --- 後半段數據 ---
    { "time": 101218, "text": "MIC Drop-①", "type": "chant" },
    { "time": 102641, "text": "MIC Drop-②", "type": "chant" },
    { "time": 104186, "text": "발 발", "type": "chant" },
    { "time": 105546, "text": "말 말", "type": "chant" },
    { "time": 106972, "text": "scream!", "type": "scream" },
    { "time": 111950, "text": "MIC Drop-①", "type": "chant" },
    { "time": 113376, "text": "MIC Drop-②", "type": "chant" }, 
    { "time": 114802, "text": "발 발", "type": "chant" }, 
    { "time": 116228, "text": "말 말", "type": "chant" },
    { "time": 119583, "text": "(자)", "type": "chant" },
    { "time": 120996, "text": "(ah)", "type": "chant" },
    { "time": 125215, "text": "쌔 쌤통", "type": "chant" },
    { "time": 127809, "text": "행복", "type": "chant" },
    { "time": 129235, "text": "scream!", "type": "scream" },
    { "time": 139143, "text": "MIC Drop baam", "type": "chant" },
    { "time": 141571, "text": "(bag)-①", "type": "chant" },
    { "time": 142960, "text": "(bag)-②", "type": "chant" },
    { "time": 145075, "text": "(가득해)", "type": "chant" },
    { "time": 147181, "text": "(that)-①", "type": "chant" },
    { "time": 148589, "text": "(that)-②", "type": "chant" },
    { "time": 150710, "text": "(학을 떼)", "type": "chant" },
    { "time": 153917, "text": "(성공)", "type": "chant" },
    { "time": 156741, "text": "(봉송)", "type": "chant" },
    { "time": 159567, "text": "(숑숑)", "type": "chant" },
    { "time": 160993, "text": "scream!", "type": "scream" },
    { "time": 168614, "text": "MIC Drop-①", "type": "chant" },
    { "time": 170072, "text": "MIC Drop-②", "type": "chant" },
    { "time": 171687, "text": "발 발", "type": "chant" },
    { "time": 172951, "text": "말 말", "type": "chant" },
    { "time": 174377, "text": "scream!", "type": "scream" },
    { "time": 179955, "text": "MIC Drop-①", "type": "chant" },
    { "time": 181351, "text": "MIC Drop-②", "type": "chant" },
    { "time": 182886, "text": "발 발", "type": "chant" },
    { "time": 184287, "text": "말 말", "type": "chant" },
    { "time": 185087, "text": "scream!", "type": "scream" },
    { "time": 200252, "text": "마지막 인사야", "type": "sing" },
    { "time": 205779, "text": "사과도 하지 마", "type": "sing" },
    { "time": 211480, "text": "마지막 인사야", "type": "sing" },
    { "time": 217108, "text": "사과도 하지 마", "type": "sing" },
    { "time": 219610, "text": "잘", "type": "sing" },
    { "time": 220336, "text": "봐", "type": "sing" },
    { "time": 222381, "text": "탁", "type": "sing" },
    { "time": 223111, "text": "쏴", "type": "sing" },
    { "time": 225225, "text": "각", "type": "sing" },
    { "time": 225932, "text": "막", "type": "sing" },
    { "time": 228045, "text": "폼나지-①", "type": "sing" },
    { "time": 229486, "text": "폼나지-②", "type": "sing" },
    { "time": 230912, "text": "scream!", "type": "scream" },


    // --- 🏆 結業證書觸發 ---
    { "time": 239700, "text": "", "type": "end" }

];
