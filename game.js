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
const OBSTACLE_SPEED = 5;

function getMaxPlayerX() {
    return game.clientWidth - player.offsetWidth;
}

function startGame() {

    playerX =
        (game.clientWidth - player.offsetWidth) / 2;

    obstacleX =
        Math.floor(
            Math.random() *
            (game.clientWidth - obstacle.offsetWidth)
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

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    if (gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const elapsed =
        Date.now() - startTime - totalPausedTime;

    const remaining =
        Math.max(
            0,
            Math.ceil((gameTime - elapsed) / 1000)
        );

    statusText.textContent =
        "남은 시간: " + remaining + "초";

    if (elapsed >= gameTime) {
        success();
        return;
    }

    obstacleY += OBSTACLE_SPEED;

    if (obstacleY > game.clientHeight) {

        obstacleY = -obstacle.offsetHeight;

        obstacleX =
            Math.floor(
                Math.random() *
                (game.clientWidth - obstacle.offsetWidth)
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

function checkCollision() {

    const playerLeft = playerX;

    const playerRight =
        playerX + player.offsetWidth;

    const playerTop =
        game.clientHeight -
        15 -
        player.offsetHeight;

    const playerBottom =
        playerTop +
        player.offsetHeight;

    const obstacleLeft = obstacleX;

    const obstacleRight =
        obstacleX +
        obstacle.offsetWidth;

    const obstacleTop = obstacleY;

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

function gameOver() {

    gameRunning = false;
    gamePaused = false;

    statusText.textContent =
        "GAME OVER 💥";

    pauseButton.textContent =
        "일시정지";
}

function success() {

    gameRunning = false;
    gamePaused = false;

    statusText.textContent =
        "SUCCESS! 🚀";

    pauseButton.textContent =
        "일시정지";
}

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
            Date.now() - pausedTime;

        totalPausedTime += pauseDuration;

        gamePaused = false;

        statusText.textContent =
            "게임 재개";

        pauseButton.textContent =
            "일시정지";
    }
}

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key.toLowerCase() === "r") {
            startGame();
            return;
        }

        if (event.key.toLowerCase() === "p") {
            togglePause();
            return;
        }

        if (!gameRunning || gamePaused) {
            return;
        }

        if (event.repeat) {
            return;
        }

        const maxPlayerX =
            getMaxPlayerX();

        if (event.key === "ArrowLeft") {

            event.preventDefault();

            playerX -= 20;

            if (playerX < 0) {
                playerX = 0;
            }

            player.style.left =
                playerX + "px";
        }

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
                Math.max(0, maxPlayerX);

            player.style.left =
                playerX + "px";
        }

        const maxObstacleX =
            game.clientWidth -
            obstacle.offsetWidth;

        if (obstacleX > maxObstacleX) {

            obstacleX =
                Math.max(0, maxObstacleX);

            obstacle.style.left =
                obstacleX + "px";
        }
    }
);

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
