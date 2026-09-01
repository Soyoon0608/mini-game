const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const statusText = document.getElementById("status");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");

let playerX = 0;
let obstacleX = 100;
let obstacleY = -40;

let gameRunning = false;
let gamePaused = false;

let startTime = 0;
let pausedTime = 0;
let totalPausedTime = 0;

const gameTime = 20000;

/* 과제 3 난이도 값 */
const OBSTACLE_SPEED = 15;


/* =========================================
   카드 4 — 저장과 손상 복구
   ========================================= */

/* 기본 저장값 */
const DEFAULT_SAVE = {
    bestTime: 0
};


/* 저장 데이터 불러오기 */
function loadSave() {

    let saved;

    try {
        saved = localStorage.getItem("gameSave");
    } catch (error) {
        return { ...DEFAULT_SAVE };
    }

    /* 저장값이 없거나 빈 값 */
    if (!saved || saved.trim() === "") {
        return { ...DEFAULT_SAVE };
    }

    try {

        const data = JSON.parse(saved);

        /* 저장 데이터가 객체인지 확인 */
        if (
            data === null ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return { ...DEFAULT_SAVE };
        }

        /* bestTime 형식 검사 */
        if (
            typeof data.bestTime !== "number" ||
            !Number.isFinite(data.bestTime) ||
            data.bestTime < 0
        ) {
            return { ...DEFAULT_SAVE };
        }

        return {
            bestTime: data.bestTime
        };

    } catch (error) {

        /* JSON이 깨져 있으면 기본값 */
        return { ...DEFAULT_SAVE };
    }
}


/* 저장 데이터 저장 */
function saveGame(data) {

    try {

        localStorage.setItem(
            "gameSave",
            JSON.stringify(data)
        );

    } catch (error) {

        /* 저장할 수 없어도 게임은 계속 실행 */
        console.warn("저장 데이터를 저장할 수 없습니다.");
    }
}


/* 현재 저장 데이터 */
let saveData = loadSave();


function getMaxPlayerX() {

    return game.clientWidth - player.offsetWidth;
}


/* =========================================
   게임 시작
   ========================================= */

function startGame() {

    /*
       C22
       새 게임 시작 시 현재 판 상태를 초기화한다.
    */

    playerX =
        (game.clientWidth - player.offsetWidth) / 2;

    obstacleX =
        Math.floor(
            Math.random() *
            (game.clientWidth - obstacle.offsetWidth)
        );

    obstacleY =
        -obstacle.offsetHeight;

    gameRunning = true;
    gamePaused = false;

    startTime = Date.now();
    pausedTime = 0;
    totalPausedTime = 0;

    /* 화면도 함께 초기화 */
    player.style.left =
        playerX + "px";

    obstacle.style.left =
        obstacleX + "px";

    obstacle.style.top =
        obstacleY + "px";

    statusText.textContent =
        "남은 시간: 20초";

    pauseButton.textContent =
        "일시정지";

    requestAnimationFrame(gameLoop);
}


/* =========================================
   게임 루프
   ========================================= */

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    if (gamePaused) {

        requestAnimationFrame(gameLoop);
        return;
    }

    const elapsed =
        Date.now() -
        startTime -
        totalPausedTime;

    const remaining =
        Math.max(
            0,
            Math.ceil(
                (gameTime - elapsed) / 1000
            )
        );

    statusText.textContent =
        "남은 시간: " +
        remaining +
        "초";

    if (elapsed >= gameTime) {

        success();
        return;
    }

    obstacleY += OBSTACLE_SPEED;

    if (obstacleY > game.clientHeight) {

        obstacleY =
            -obstacle.offsetHeight;

        obstacleX =
            Math.floor(
                Math.random() *
                (game.clientWidth -
                    obstacle.offsetWidth)
            );

        obstacle.style.left =
            obstacleX + "px";
    }

    obstacle.style.top =
        obstacleY + "px";

    checkCollision();

    if (gameRunning) {

        requestAnimationFrame(gameLoop);
    }
}


/* =========================================
   충돌 검사
   ========================================= */

function checkCollision() {

    const playerLeft =
        playerX;

    const playerRight =
        playerX +
        player.offsetWidth;

    const playerTop =
        game.clientHeight -
        15 -
        player.offsetHeight;

    const playerBottom =
        playerTop +
        player.offsetHeight;

    const obstacleLeft =
        obstacleX;

    const obstacleRight =
        obstacleX +
        obstacle.offsetWidth;

    const obstacleTop =
        obstacleY;

    const obstacleBottom =
        obstacleY +
        obstacle.offsetHeight;

    if (
        playerLeft < obstacleRight &&
        playerRight > obstacleLeft &&
        playerTop < obstacleBottom &&
        playerBottom > obstacleTop
    ) {

        gameOver();
    }
}


/* =========================================
   게임 오버
   ========================================= */

function gameOver() {

    gameRunning = false;
    gamePaused = false;

    statusText.textContent =
        "GAME OVER 💥";

    pauseButton.textContent =
        "일시정지";
}


/* =========================================
   성공
   ========================================= */

function success() {

    gameRunning = false;
    gamePaused = false;

    /*
       실제 생존 시간 계산
    */
    const elapsed =
        Math.min(
            gameTime,
            Date.now() -
            startTime -
            totalPausedTime
        );

    const survivedSeconds =
        Math.floor(
            elapsed / 1000
        );

    /*
       C23
       보존하기로 한 최고 기록을 저장한다.
    */

    if (
        survivedSeconds >
        saveData.bestTime
    ) {

        saveData.bestTime =
            survivedSeconds;

        saveGame(saveData);
    }

    statusText.textContent =
        "SUCCESS! 🚀 최고 기록: " +
        saveData.bestTime +
        "초";

    pauseButton.textContent =
        "일시정지";
}


/* =========================================
   일시정지
   ========================================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }

    if (!gamePaused) {

        gamePaused = true;
        pausedTime = Date.now();

        statusText.textContent =
            "PAUSED";

        pauseButton.textContent =
            "재개";

    } else {

        const pauseDuration =
            Date.now() -
            pausedTime;

        totalPausedTime +=
            pauseDuration;

        gamePaused = false;

        statusText.textContent =
            "게임 재개";

        pauseButton.textContent =
            "일시정지";
    }
}


/* =========================================
   키보드 조작
   ========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        /* R = 다시 시작 */
        if (
            event.key.toLowerCase() === "r"
        ) {

            startGame();
            return;
        }

        /* P = 일시정지 */
        if (
            event.key.toLowerCase() === "p"
        ) {

            togglePause();
            return;
        }

        if (
            !gameRunning ||
            gamePaused
        ) {

            return;
        }

        if (event.repeat) {
            return;
        }

        const maxPlayerX =
            getMaxPlayerX();

        /* 왼쪽 */
        if (event.key === "ArrowLeft") {

            event.preventDefault();

            playerX -= 20;

            if (playerX < 0) {
                playerX = 0;
            }

            player.style.left =
                playerX + "px";
        }

        /* 오른쪽 */
        if (event.key === "ArrowRight") {

            event.preventDefault();

            playerX += 20;

            if (playerX > maxPlayerX) {
                playerX = maxPlayerX;
            }

            player.style.left =
                playerX + "px";
        }
    }
);


/* =========================================
   버튼
   ========================================= */

pauseButton.addEventListener(
    "click",
    function() {

        togglePause();
    }
);


startButton.addEventListener(
    "click",
    function() {

        startGame();
    }
);


/* =========================================
   화면 크기 변경
   ========================================= */

window.addEventListener(
    "resize",
    function() {

        if (!gameRunning) {
            return;
        }

        const maxPlayerX =
            getMaxPlayerX();

        if (playerX > maxPlayerX) {

            playerX =
                Math.max(
                    0,
                    maxPlayerX
                );

            player.style.left =
                playerX + "px";
        }

        const maxObstacleX =
            game.clientWidth -
            obstacle.offsetWidth;

        if (obstacleX > maxObstacleX) {

            obstacleX =
                Math.max(
                    0,
                    maxObstacleX
                );

            obstacle.style.left =
                obstacleX + "px";
        }
    }
);


/* =========================================
   브라우저 탭 전환
   ========================================= */

document.addEventListener(
    "visibilitychange",
    function() {

        if (!gameRunning) {
            return;
        }

        if (document.hidden) {

            if (!gamePaused) {
                togglePause();
            }

        } else {

            if (gamePaused) {

                statusText.textContent =
                    "PAUSED - P키 또는 재개 버튼";
            }
        }
    }
);
