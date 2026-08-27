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

// 게임 영역 안에서 플레이어가 움직일 수 있는 최대 X
function getMaxPlayerX() {
    return game.clientWidth - player.offsetWidth;
}

// 게임 시작
function startGame() {

    playerX = Math.max(
        0,
        (game.clientWidth - player.offsetWidth) / 2
    );

    obstacleX = Math.floor(
        Math.random() * (game.clientWidth - obstacle.offsetWidth)
    );

    obstacleY = -obstacle.offsetHeight;

    gameRunning = true;
    gamePaused = false;

    startTime = Date.now();
    pausedTime = 0;
    totalPausedTime = 0;

    player.style.left = playerX + "px";
    obstacle.style.left = obstacleX + "px";
    obstacle.style.top = obstacleY + "px";

    statusText.textContent = "남은 시간: 20초";

    pauseButton.textContent = "일시정지";

    requestAnimationFrame(gameLoop);
}


// 게임 루프
function gameLoop() {

    if (!gameRunning) {
        return;
    }

    // 일시정지 중에는 게임 진행하지 않음
    if (gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const elapsed =
        Date.now() - startTime - totalPausedTime;

    const remaining =
        Math.max(0, Math.ceil((gameTime - elapsed) / 1000));

    statusText.textContent =
        "남은 시간: " + remaining + "초";

    // 20초 생존 성공
    if (elapsed >= gameTime) {
        success();
        return;
    }

    // 장애물 이동
    obstacleY += 5;

    // 장애물이 아래로 지나가면 다시 위에서 생성
    if (obstacleY > game.clientHeight) {

        obstacleY = -obstacle.offsetHeight;

        obstacleX = Math.floor(
            Math.random() *
            (game.clientWidth - obstacle.offsetWidth)
        );

        obstacle.style.left = obstacleX + "px";
    }

    obstacle.style.top = obstacleY + "px";

    checkCollision();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}


// 충돌 검사
function checkCollision() {

    const playerLeft = playerX;
    const playerRight =
        playerX + player.offsetWidth;

    // CSS bottom: 20px 기준으로 실제 위치 계산
    const playerTop =
        game.clientHeight -
        20 -
        player.offsetHeight;

    const playerBottom =
        playerTop + player.offsetHeight;

    const obstacleLeft = obstacleX;
    const obstacleRight =
        obstacleX + obstacle.offsetWidth;

    const obstacleTop = obstacleY;
    const obstacleBottom =
        obstacleY + obstacle.offsetHeight;

    if (
        playerLeft < obstacleRight &&
        playerRight > obstacleLeft &&
        playerTop < obstacleBottom &&
        playerBottom > obstacleTop
    ) {
        gameOver();
    }
}


// 게임 오버
function gameOver() {

    gameRunning = false;
    gamePaused = false;

    statusText.textContent = "GAME OVER";

    pauseButton.textContent = "일시정지";
}


// 성공
function success() {

    gameRunning = false;
    gamePaused = false;

    statusText.textContent = "SUCCESS!";

    pauseButton.textContent = "일시정지";
}


// 일시정지 / 재개
function togglePause() {

    if (!gameRunning) {
        return;
    }

    if (!gamePaused) {

        gamePaused = true;

        pausedTime = Date.now();

        statusText.textContent = "PAUSED";

        pauseButton.textContent = "재개";

    } else {

        const pauseDuration =
            Date.now() - pausedTime;

        totalPausedTime += pauseDuration;

        gamePaused = false;

        statusText.textContent = "게임 재개";

        pauseButton.textContent = "일시정지";
    }
}


// 키보드 입력
document.addEventListener("keydown", function(event) {

    // R은 게임 중이 아니어도 동작
    if (event.key.toLowerCase() === "r") {
        startGame();
        return;
    }

    // P는 일시정지 / 재개
    if (event.key.toLowerCase() === "p") {
        togglePause();
        return;
    }

    if (!gameRunning || gamePaused) {
        return;
    }

    // 브라우저의 키 자동 반복으로 중복 입력되는 것을 방지
    if (event.repeat) {
        return;
    }

    const maxPlayerX = getMaxPlayerX();

    if (event.key === "ArrowLeft") {

        event.preventDefault();

        playerX -= 20;

        if (playerX < 0) {
            playerX = 0;
        }

        player.style.left = playerX + "px";
    }

    if (event.key === "ArrowRight") {

        event.preventDefault();

        playerX += 20;

        if (playerX > maxPlayerX) {
            playerX = maxPlayerX;
        }

        player.style.left = playerX + "px";
    }
});


// 일시정지 버튼
pauseButton.addEventListener("click", function() {
    togglePause();
});


// 시작 버튼
startButton.addEventListener("click", function() {
    startGame();
});


// 창 크기가 변경되었을 때
window.addEventListener("resize", function() {

    if (!gameRunning) {
        return;
    }

    const maxPlayerX = getMaxPlayerX();

    // 플레이어가 화면 밖으로 나가지 않도록 보정
    if (playerX > maxPlayerX) {
        playerX = maxPlayerX;
        player.style.left = playerX + "px";
    }

    // 장애물도 게임 영역 밖으로 나가지 않도록 보정
    const maxObstacleX =
        game.clientWidth - obstacle.offsetWidth;

    if (obstacleX > maxObstacleX) {
        obstacleX = Math.max(0, maxObstacleX);
        obstacle.style.left = obstacleX + "px";
    }
});


// 브라우저 탭을 벗어났을 때
document.addEventListener("visibilitychange", function() {

    if (!gameRunning) {
        return;
    }

    if (document.hidden) {

        if (!gamePaused) {
            togglePause();
        }

    } else {

        // 포커스 복귀 후 자동으로 재개하지 않고
        // 사용자가 직접 재개하도록 함
        if (gamePaused) {
            statusText.textContent = "PAUSED - P키 또는 재개 버튼";
        }
    }
});


// 브라우저 창 자체에서 포커스를 잃었을 때
window.addEventListener("blur", function() {

    if (!gameRunning || gamePaused) {
        return;
    }

    togglePause();

});


// 창으로 다시 돌아왔을 때
window.addEventListener("focus", function() {

    if (!gameRunning || !gamePaused) {
        return;
    }

    statusText.textContent =
        "PAUSED - P키 또는 재개 버튼";
});
