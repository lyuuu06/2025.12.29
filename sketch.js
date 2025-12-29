let spriteSheet;
let jumpSpriteSheet;
let hitSpriteSheet;
let stopSpriteSheet;
let stop3SpriteSheet;
let touch3SpriteSheet;
let smile2SpriteSheet;
let bgImg;
let animation = [];
let jumpAnimation = [];
let hitAnimation = [];
let stopAnimation = [];
let stop3Animation = [];
let touch3Animation = [];
let smile2Animation = [];

const frameCountTotal = 12; // 跑步精靈圖的總影格數
const jumpFrameCountTotal = 13; // 跳躍精靈圖的總影格數
const hitFrameCountTotal = 6; // 打擊精靈圖的總影格數
const stopFrameCountTotal = 8; // 新增角色的總影格數
const stop3FrameCountTotal = 7; // 第三個角色的總影格數
const touch3FrameCountTotal = 11; // 角色3互動動畫的總影格數
const smile2FrameCountTotal = 6; // 角色2互動動畫的總影格數
const animationSpeed = 5; // 跑步動畫速度
const jumpAnimationSpeed = 4; // 跳躍動畫速度
const hitAnimationSpeed = 4; // 打擊動畫速度
const stopAnimationSpeed = 6; // 新增角色的動畫速度
const stop3AnimationSpeed = 8; // 第三個角色的動畫速度
const touch3AnimationSpeed = 5; // 角色3互動動畫的速度
const smile2AnimationSpeed = 5; // 角色2互動動畫的速度

// 角色屬性
let characterX, characterY;
let groundY; // 地面位置
let moveSpeed = 5;
let direction = 1; // 1: 右, -1: 左
let isMoving = false;

// 新增角色的屬性
let newCharacterX, newCharacterY;
let newCharacter3X, newCharacter3Y;
let interactionDistance = 120; // 觸發互動的距離

// --- 對話互動屬性 ---
let optionButtons = []; // 儲存選項按鈕
let isInteractingWithChar2 = false;
let char2Text = '';
let char2Response = '';
let quizTable; // 儲存CSV測驗題庫
let currentQuestion = null; // 儲存當前抽到的題目物件
let quizState = 'idle'; // 問答狀態: idle, asking, answered
let isQuestionSolved = false; // 追蹤當前題目是否已解決
let lastAnswerTime = 0; // 記錄答對時間

// --- Game State ---
let gameState = 'start'; // 'start' or 'playing'
let startBgImg;
let startButton;

// --- 角色3 互動屬性 ---
let hintButton;
let isInteractingWithChar3 = false;
let char3Text = '';

// 跳躍屬性
let isJumping = false;
let velocityY = 0;
let gravity = 0.6;
let jumpForce = -12;
let jumpFrame = 0;

// 打擊屬性
let isHitting = false;
let hitFrame = 0;


function preload() {
  // 預先載入圖片資源
  spriteSheet = loadImage('1/run/run_1.png');
  jumpSpriteSheet = loadImage('1/jump/jump_1.png');
  hitSpriteSheet = loadImage('1/hit/hit_1.png');
  stopSpriteSheet = loadImage('2/stop/stop_2.png');
  stop3SpriteSheet = loadImage('3/stop/stop_3.png');
  touch3SpriteSheet = loadImage('3/touch/touch_3.png');
  smile2SpriteSheet = loadImage('2/smile/smile_2.png');
  bgImg = loadImage('background/background_1.png');
  startBgImg = loadImage('background/background_2.png');
}

function setup() {
  // 建立一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);
  
  // --- Start Screen Button ---
  startButton = createButton('開始遊戲');
  startButton.position(width / 2 - 125, height / 2 - 35); // 調整位置以保持置中
  startButton.size(250, 70); // 加大按鈕
  startButton.style('font-size', '32px'); // 加大字體
  startButton.style('background-color', '#FFFFFF'); // 白色背景
  startButton.style('color', 'black'); // 黑色文字
  startButton.style('border', '3px solid #000000'); // 黑色邊框
  startButton.style('border-radius', '12px');
  startButton.style('cursor', 'pointer');
  startButton.mousePressed(startGame);

  // --- 建立教育科技系相關題庫 (取代 CSV) ---
  quizTable = new p5.Table();
  quizTable.addColumn('question');
  quizTable.addColumn('answer');
  quizTable.addColumn('correct_feedback');
  quizTable.addColumn('incorrect_feedback');
  quizTable.addColumn('opt1');
  quizTable.addColumn('opt2');
  quizTable.addColumn('opt3');

  let etQuestions = [
    { q: "教學設計最常見的模型縮寫？", a: "ADDIE", c: "答對了！是 ADDIE 模型。", i: "不對喔，是 ADDIE。", o1: "ADDIE", o2: "SAM", o3: "ASSURE" },
    { q: "TPACK 理論中的 'P' 代表什麼？", a: "教學", c: "沒錯！是 Pedagogy (教學)", i: "再想想，P 是 Pedagogy。", o1: "科技", o2: "教學", o3: "內容" },
    { q: "將遊戲元素應用於教學稱為什麼？", a: "遊戲化", c: "正解！就是 Gamification。", i: "答案是「遊戲化」。", o1: "數位化", o2: "娛樂化", o3: "遊戲化" },
    { q: "以專案為基礎的學習法縮寫是？", a: "PBL", c: "很棒！Project-Based Learning", i: "提示：P 開頭，L 結尾。", o1: "GBL", o2: "PBL", o3: "IBL" },
    { q: "教育科技系的英文縮寫是？", a: "ET", c: "答對了！Educational Technology", i: "是 ET 喔！", o1: "IT", o2: "CS", o3: "ET" },
    { q: "數位學習的英文縮寫是？", a: "e-Learning", c: "完全正確！", i: "是 e-Learning 喔。", o1: "m-Learning", o2: "e-Learning", o3: "u-Learning" },
    { q: "MOOCs 的中文意思是？", a: "磨課師", c: "答對了！大規模開放線上課程。", i: "是磨課師喔。", o1: "磨課師", o2: "創客", o3: "黑客松" },
    { q: "AR 的中文是？", a: "擴增實境", c: "答對了！Augmented Reality", i: "是擴增實境。", o1: "虛擬實境", o2: "擴增實境", o3: "混合實境" },
    { q: "VR 的中文是？", a: "虛擬實境", c: "正確！Virtual Reality", i: "是虛擬實境。", o1: "虛擬實境", o2: "擴增實境", o3: "混合實境" },
  ];

  for (let q of etQuestions) {
    let r = quizTable.addRow();
    r.setString('question', q.q);
    r.setString('answer', q.a);
    r.setString('correct_feedback', q.c);
    r.setString('incorrect_feedback', q.i);
    r.setString('opt1', q.o1);
    r.setString('opt2', q.o2);
    r.setString('opt3', q.o3);
  }
  
  // --- 處理跑步動畫 ---
  let frameWidth = spriteSheet.width / frameCountTotal;
  let frameHeight = spriteSheet.height;
  for (let i = 0; i < frameCountTotal; i++) {
    let frame = spriteSheet.get(i * frameWidth, 0, frameWidth, frameHeight);
    animation.push(frame);
  }

  // --- 處理跳躍動畫 ---
  let jumpFrameWidth = jumpSpriteSheet.width / jumpFrameCountTotal;
  let jumpFrameHeight = jumpSpriteSheet.height;
  for (let i = 0; i < jumpFrameCountTotal; i++) {
    let frame = jumpSpriteSheet.get(i * jumpFrameWidth, 0, jumpFrameWidth, jumpFrameHeight);
    jumpAnimation.push(frame);
  }
  
  // --- 處理打擊動畫 ---
  let hitFrameWidth = hitSpriteSheet.width / hitFrameCountTotal;
  let hitFrameHeight = hitSpriteSheet.height;
  for (let i = 0; i < hitFrameCountTotal; i++) {
    let frame = hitSpriteSheet.get(i * hitFrameWidth, 0, hitFrameWidth, hitFrameHeight);
    hitAnimation.push(frame);
  }

  // --- 處理新增角色動畫 ---
  let stopFrameWidth = stopSpriteSheet.width / stopFrameCountTotal;
  let stopFrameHeight = stopSpriteSheet.height;
  for (let i = 0; i < stopFrameCountTotal; i++) {
    let frame = stopSpriteSheet.get(i * stopFrameWidth, 0, stopFrameWidth, stopFrameHeight);
    stopAnimation.push(frame);
  }
  
  // --- 處理第三個角色動畫 ---
  let stop3FrameWidth = stop3SpriteSheet.width / stop3FrameCountTotal;
  let stop3FrameHeight = stop3SpriteSheet.height;
  for (let i = 0; i < stop3FrameCountTotal; i++) {
    let frame = stop3SpriteSheet.get(i * stop3FrameWidth, 0, stop3FrameWidth, stop3FrameHeight);
    stop3Animation.push(frame);
  }

  // --- 處理角色3互動動畫 ---
  let touch3FrameWidth = touch3SpriteSheet.width / touch3FrameCountTotal;
  let touch3FrameHeight = touch3SpriteSheet.height;
  for (let i = 0; i < touch3FrameCountTotal; i++) {
    let frame = touch3SpriteSheet.get(i * touch3FrameWidth, 0, touch3FrameWidth, touch3FrameHeight);
    touch3Animation.push(frame);
  }

  // --- 處理角色2互動動畫 ---
  let smile2FrameWidth = smile2SpriteSheet.width / smile2FrameCountTotal;
  let smile2FrameHeight = smile2SpriteSheet.height;
  for (let i = 0; i < smile2FrameCountTotal; i++) {
    let frame = smile2SpriteSheet.get(i * smile2FrameWidth, 0, smile2FrameWidth, smile2FrameHeight);
    smile2Animation.push(frame);
  }

  // 將圖片的繪製模式設定為以中心點為基準
  imageMode(CENTER);

  // 初始化角色位置在畫面中央
  characterX = width / 2;
  groundY = height * 0.75; // 將初始Y位置設為地面 (往下移動貼近背景地面)
  characterY = groundY;

  // 初始化新角色的位置，使其固定在原角色初始位置的左邊
  newCharacterX = characterX - 150;
  newCharacterY = groundY;

  // 初始化第三個角色的位置，使其固定在原角色初始位置的右邊
  newCharacter3X = characterX + 150;
  newCharacter3Y = groundY;
}

function draw() {
  if (gameState === 'start') {
    // --- Start Screen ---
    let bgScale = max(width / startBgImg.width, height / startBgImg.height);
    image(startBgImg, width / 2, height / 2, startBgImg.width * bgScale, startBgImg.height * bgScale);
    startButton.position(width / 2 - 125, height / 2 - 35); // 調整位置以保持置中
  } else if (gameState === 'playing') {
    // --- Main Game Loop ---
    startButton.hide();

    // 設定背景顏色
    // 計算縮放比例以達成全螢幕置中 (Cover 效果)
    let bgScale = max(width / bgImg.width, height / bgImg.height);
    image(bgImg, width / 2, height / 2, bgImg.width * bgScale, bgImg.height * bgScale);

    // --- 狀態更新 ---
    if (isJumping) {
      // 1. 跳躍狀態 (最高優先級)
      velocityY += gravity; // 套用重力
      characterY += velocityY;
      jumpFrame += 1 / jumpAnimationSpeed;

      // 判斷是否落地
      if (characterY >= groundY) {
        characterY = groundY; // 確保角色回到地面
        isJumping = false;
        jumpFrame = 0;
      }
    } else if (isHitting) {
      // 2. 打擊狀態
      hitFrame += 1 / hitAnimationSpeed;
      if (hitFrame >= hitFrameCountTotal) {
        isHitting = false;
        hitFrame = 0;
      }
    } else {
      // 3. 地面待機/移動狀態
      isMoving = false; // 先假設角色沒有移動
      if (keyIsDown(RIGHT_ARROW)) {
        characterX += moveSpeed;
        direction = 1;
        isMoving = true;
      }
      if (keyIsDown(LEFT_ARROW)) {
        characterX -= moveSpeed;
        direction = -1;
        isMoving = true;
      }
      // 監聽跳躍鍵
      if (keyIsDown(UP_ARROW)) {
        isJumping = true;
        velocityY = jumpForce;
      }
      // 監聽空白鍵 (打擊)
      if (keyIsDown(32)) { // 32 是空白鍵的 keycode
        isHitting = true;
      }
    }

    // --- 繪製新增的角色 ---
    push();
    // 檢查角色1和角色2的距離
    let distance2 = abs(characterX - newCharacterX);
    let isClose2 = distance2 < interactionDistance;
    
    // 如果答對了，等待2秒後自動換下一題
    if (isClose2 && quizState === 'answered' && isQuestionSolved) {
      if (millis() - lastAnswerTime > 2000) {
        quizState = 'idle';
        char2Response = '';
      }
    }

    // --- 處理與角色2的問答互動 ---
    if (isClose2 && quizState === 'idle') { // 靠近且處於閒置狀態
      // 檢查題庫是否成功載入
      if (!quizTable || quizTable.getRowCount() === 0) {
        char2Text = "糟糕，題庫讀取失敗了！";
        // 可以在此處停留，或設定一個狀態讓玩家知道問題
        return; // 提前結束 draw 函式中關於此角色的後續處理
      }

      // 靠近時，如果處於閒置狀態，則開始提問
      quizState = 'asking';
      isInteractingWithChar2 = true;
      
      // --- 選題邏輯更新 ---
      if (currentQuestion === null) {
        // 第一次遇到，強制顯示第一題
        currentQuestion = quizTable.getRow(0);
        isQuestionSolved = false;
      } else if (isQuestionSolved) {
        // 只有當上一題答對了，才隨機換新題目
        let questionIndex = floor(random(quizTable.getRowCount()));
        currentQuestion = quizTable.getRow(questionIndex);
        isQuestionSolved = false;
      }
      // 如果沒答對 (isQuestionSolved 為 false)，則保持原本的 currentQuestion 不變
      
      char2Text = currentQuestion.getString('question');
      char2Response = ''; // 清空回答

      // 建立三個選項按鈕
      let options = [currentQuestion.getString('opt1'), currentQuestion.getString('opt2'), currentQuestion.getString('opt3')];
      options = shuffle(options); // 隨機排列選項

      for (let i = 0; i < options.length; i++) {
        let btn = createButton(options[i]);
        btn.size(80, 30); // 設定按鈕大小
        btn.style('background-color', '#fff');
        btn.style('border', '1px solid #000');
        btn.style('border-radius', '5px');
        btn.style('cursor', 'pointer');
        btn.mousePressed(() => checkAnswer(options[i]));
        optionButtons.push(btn);
      }
    } else if (!isClose2 && isInteractingWithChar2) {
      // 結束互動
      isInteractingWithChar2 = false;
      char2Text = '';
      char2Response = '';
      for (let btn of optionButtons) btn.remove();
      optionButtons = [];
    } else if (!isClose2 && quizState === 'answered') {
      // 當玩家回答完問題並離開後，重置狀態以便下次提問
      quizState = 'idle';
      char2Text = '';
      char2Response = '';
    }
    if (!isClose2 && quizState !== 'idle') {
      quizState = 'idle'; // 遠離時重置問答狀態
    }

    // (移除原本更新輸入框位置的程式碼，改在下方繪製時更新按鈕位置)

    // 讓角色2總是面向角色1
    let direction2;
    if (characterX > newCharacterX) {
      direction2 = 1; // 角色1在右邊，角色2朝右 (不翻轉)
    } else {
      direction2 = -1; // 角色1在左邊，角色2朝左 (水平翻轉)
    }

    translate(newCharacterX, newCharacterY); // 將原點移動到角色2的位置
    scale(direction2, 1); // 根據方向翻轉

    let imageToDraw2;
    if (isClose2) {
      // 如果靠近，播放互動動畫
      let smile2FrameIndex = floor(frameCount / smile2AnimationSpeed) % smile2FrameCountTotal;
      imageToDraw2 = smile2Animation[smile2FrameIndex];
    } else {
      // 如果遠離，播放待機動畫
      let stopFrameIndex = floor(frameCount / stopAnimationSpeed) % stopFrameCountTotal;
      imageToDraw2 = stopAnimation[stopFrameIndex];
    }
    image(imageToDraw2, 0, 0); // 在新的原點繪製角色

    // --- 在角色2頭上繪製文字 ---
    if (isInteractingWithChar2) {
      push();
      scale(direction2, 1); // 將文字方向翻轉回來，使其總是正向
      
      // 如果有回饋，顯示回饋；否則顯示問題
      let textToShow = char2Response || char2Text;

      textSize(16);
      textFont('Noto Sans TC'); // 使用更纖細的 Noto Sans TC 字體

      if (optionButtons.length > 0) {
        // --- 顯示題目與選項 (同一行) ---
        let btnW = 80;
        let gap = 10;
        let padding = 15;
        let txtW = textWidth(textToShow);
        
        // 計算總寬度: 文字寬 + 間距 + (按鈕寬+間距)*3
        let totalContentW = txtW + gap + (btnW + gap) * 3 - gap;
        let boxW = totalContentW + padding * 2;
        let boxH = 60;

        // 繪製長條形方框
        rectMode(CENTER);
        stroke(0);
        strokeWeight(2);
        fill(255, 255, 255, 240);
        rect(0, -130, boxW, boxH, 10);

        // 繪製文字 (靠左對齊內容起始處)
        fill(0);
        noStroke(); // 取消文字邊框，讓字體看起來更細
        textAlign(LEFT, CENTER);
        let startX = -totalContentW / 2;
        text(textToShow, startX, -130);

        // 更新按鈕位置 (接在文字後面)
        let btnStartX = newCharacterX + startX + txtW + gap;
        let btnY = newCharacterY - 130 - 15; // 15是按鈕高度的一半 (30/2)
        
        for (let i = 0; i < optionButtons.length; i++) {
          optionButtons[i].position(btnStartX + i * (btnW + gap), btnY);
        }
      } else {
        // --- 僅顯示回饋文字 ---
        let padding = 10;
        let boxWidth = textWidth(textToShow) + padding * 2;
        let boxHeight = textSize() + padding * 2;
        rectMode(CENTER);
        stroke(0);
        strokeWeight(2);
        fill(255);
        rect(0, -130, boxWidth, boxHeight, 5);
        fill(0);
        noStroke(); // 取消文字邊框
        textAlign(CENTER, CENTER);
        text(textToShow, 0, -130);
      }
      pop();
    }
    pop();

    // --- 繪製第三個角色 ---
    push();
    // 檢查角色1和角色3的距離
    let distance3 = abs(characterX - newCharacter3X);
    let isClose3 = distance3 < interactionDistance;

    // --- 角色3 互動邏輯 ---
    if (isClose3) {
      if (!isInteractingWithChar3) {
        isInteractingWithChar3 = true;
        char3Text = '需不需要提示呢？';
        
        if (!hintButton) {
          hintButton = createButton('是');
          hintButton.size(60, 30);
          hintButton.style('background-color', '#fff');
          hintButton.style('border', '1px solid #000');
          hintButton.style('border-radius', '5px');
          hintButton.style('cursor', 'pointer');
          hintButton.mousePressed(provideHint);
        }
      }
      
      // 更新按鈕位置
      if (hintButton && char3Text === '需不需要提示呢？') {
          hintButton.position(newCharacter3X - 30, newCharacter3Y - 160); // 按鈕顯示在方框內下方
          hintButton.show();
      } else if (hintButton) {
          hintButton.hide();
      }
    } else {
      isInteractingWithChar3 = false;
      if (hintButton) {
        hintButton.remove();
        hintButton = null;
      }
    }

    // 判斷角色1是否在角色3的左邊
    let direction3 = 1; // 預設方向 (不翻轉)
    if (characterX < newCharacter3X) {
      direction3 = -1; // 如果角色1在左邊，則水平翻轉
    }

    translate(newCharacter3X, newCharacter3Y); // 將原點移動到角色3的位置
    
    push(); // 隔離角色縮放設定，避免影響對話框
    scale(direction3 * 1.5, 1.5); // 根據方向翻轉並放大1.5倍

    let imageToDraw;
    if (isClose3) {
      // 如果靠近，播放互動動畫
      let touch3FrameIndex = floor(frameCount / touch3AnimationSpeed) % touch3FrameCountTotal;
      imageToDraw = touch3Animation[touch3FrameIndex];
    } else {
      // 如果遠離，播放待機動畫
      let stop3FrameIndex = floor(frameCount / stop3AnimationSpeed) % stop3FrameCountTotal;
      imageToDraw = stop3Animation[stop3FrameIndex];
    }
    image(imageToDraw, 0, 0); // 在新的原點繪製角色3
    pop();

    // --- 繪製角色3對話框 (不隨角色翻轉) ---
    if (isInteractingWithChar3) {
        let boxSize = 160;
        let boxY = -220; // 顯示在角色上方

        rectMode(CENTER);
        stroke(0);
        strokeWeight(2);
        fill(255, 255, 255, 240);
        rect(0, boxY, boxSize, boxSize, 10); // 方形文字框

        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(18);
        
        // 文字位置調整
        let textY = boxY;
        if (char3Text === '需不需要提示呢？') {
            textY = boxY - 20; // 留空間給按鈕
        }
        text(char3Text, 0, textY);
    }

    pop();

    // --- 繪製角色 ---
    push(); // 儲存當前的繪圖設定
    translate(characterX, characterY); // 將畫布原點移動到角色位置
    scale(direction, 1); // 根據方向翻轉畫布 (1 不變, -1 水平翻轉)
    
    let currentImage;
    if (isJumping) {
      let currentJumpFrameIndex = floor(jumpFrame) % jumpFrameCountTotal;
      currentImage = jumpAnimation[currentJumpFrameIndex];
    } else if (isHitting) {
      let currentHitFrameIndex = floor(hitFrame);
      currentImage = hitAnimation[currentHitFrameIndex];
    } else {
      if (isMoving) {
        // 如果在移動，就播放跑步動畫
        let currentFrameIndex = floor(frameCount / animationSpeed) % frameCountTotal;
        currentImage = animation[currentFrameIndex];
      } else {
        // 如果靜止，就顯示第一個影格
        currentImage = animation[0];
      }
    }
    
    // 在新的原點 (0,0) 繪製角色
    image(currentImage, 0, 0);
    
    pop(); // 恢復原本的繪圖設定

    // --- 繪製右上角文字 ---
    push();
    fill(0); // 黑色字體
    textAlign(RIGHT, TOP);
    textSize(20); // 設定一個適當的大小
    text('414730605羅郁婷', width - 10, 10); // 繪製在右上角，留10px邊距
    pop();
  }
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 同時更新地面位置，避免角色懸空或陷入地下
  groundY = height * 0.75;
  if (gameState === 'start' && startButton) {
    startButton.position(width / 2 - 125, height / 2 - 35); // 調整位置以保持置中
  }
}

function checkAnswer(userAnswer) {
  // 檢查使用者點擊的選項
  let correctAnswer = currentQuestion.getString('answer');

  if (userAnswer === correctAnswer) {
    // 答對了
    char2Response = currentQuestion.getString('correct_feedback');
    isQuestionSolved = true; // 標記為已解決，下次靠近會換題
    lastAnswerTime = millis();
  } else {
    // 答錯了
    char2Response = '錯誤!';
    isQuestionSolved = false; // 標記為未解決，下次靠近還是這題
  }

  char2Text = ''; // 清除題目文字，只顯示回饋
  for (let btn of optionButtons) btn.remove(); // 移除所有按鈕
  optionButtons = [];
  quizState = 'answered'; // 更新狀態為已回答
  // isInteractingWithChar2 保持 true，直到玩家離開，這樣才能持續顯示回饋
}

// --- Start Game Function ---
function startGame() {
  gameState = 'playing';
}

// --- 角色3 提示功能 ---
function provideHint() {
  if (currentQuestion && !isQuestionSolved) {
    let ans = currentQuestion.getString('answer');
    let opts = [
      currentQuestion.getString('opt1'),
      currentQuestion.getString('opt2'),
      currentQuestion.getString('opt3')
    ];
    let wrongOpts = opts.filter(o => o !== ans); // 找出所有錯誤選項
    let wrongOne = random(wrongOpts); // 隨機挑選一個錯誤選項
    char3Text = `提示：\n選項「${wrongOne}」\n是錯誤的！`;
  } else {
    char3Text = '目前沒有\n需要提示的題目喔！';
  }
  if (hintButton) hintButton.hide();
}
