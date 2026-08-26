const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const statusText = document.getElementById("status");
const startButton = document.getElementById("startButton");

let playerX = 280;
let obstacleX = 100;
let obstacleY = -40;

let gameRunning = false;
let startTime = 0;

const gameTime = 20000;

function startGame() {

    playerX = 280;
    obstacleX = Math.floor(Math.random() * 560);
    obstacleY = -40;

    player.style.left = playerX + "px";
    obstacle.style.left = obstacleX + "px";
    obstacle.style.top = obstacleY + "px";

    statusText.textContent = "PLAYING";

    gameRunning = true;
    startTime = Date.now();

    gameLoop();
}

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.ceil((gameTime - elapsed) / 1000);

    statusText.textContent = "남은 시간: " + remaining + "초";

    if (elapsed >= gameTime) {
        success();
        return;
    }

    obstacleY += 5;

    if (obstacleY > 400) {
        obstacleY = -40;
        obstacleX = Math.floor(Math.random() * 560);

        obstacle.style.left = obstacleX + "px";
    }

    obstacle.style.top = obstacleY + "px";

    checkCollision();

    requestAnimationFrame(gameLoop);
}

function checkCollision() {

    const playerLeft = playerX;
    const playerRight = playerX + 40;

    const playerTop = 380;
    const playerBottom = 420;

    const obstacleLeft = obstacleX;
    const obstacleRight = obstacleX + 40;

    const obstacleTop = obstacleY;
    const obstacleBottom = obstacleY + 40;

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

    statusText.textContent = "GAME OVER";
}

function success() {

    gameRunning = false;

    statusText.textContent = "SUCCESS!";
}

document.addEventListener("keydown", function(event) {

    if (!gameRunning) {
        return;
    }

    if (event.key === "ArrowLeft") {

        playerX -= 20;

        if (playerX < 0) {
            playerX = 0;
        }

        player.style.left = playerX + "px";
    }

    if (event.key === "ArrowRight") {

        playerX += 20;

        if (playerX > 560) {
            playerX = 560;
        }

        player.style.left = playerX + "px";
    }
});

document.addEventListener("keydown", function(event) {

    if (event.key.toLowerCase() === "r") {

        startGame();
    }
});

startButton.addEventListener("click", function() {

    startGame();
});
