const game = document.getElementById("game");

const player = document.getElementById("player");

const obstacle = document.getElementById("obstacle");

const statusText = document.getElementById("status");

const startButton = document.getElementById("startButton");

const pauseButton = document.getElementById("pauseButton");


/* =========================
   게임 변수
========================= */

let playerX = 0;

let obstacleX = 100;

let obstacleY = -40;

let gameRunning = false;

let gamePaused = false;

let startTime = 0;

let pausedTime = 0;

let totalPausedTime = 0;


/* 게임 시간 20초 */

const gameTime = 20000;


/* =========================
   플레이어 최대 X
========================= */

function getMaxPlayerX() {

    return (
        game.clientWidth -
        player.offsetWidth
    );

}


/* =========================
   게임 시작
========================= */

function startGame() {

    /* 플레이어 가운데 */

    playerX =
        (
            game.clientWidth -
            player.offsetWidth
        ) / 2;


    /* 장애물 랜덤 위치 */

    obstacleX =
        Math.floor(
            Math.random() *
            (
                game.clientWidth -
                obstacle.offsetWidth
            )
        );


    /* 장애물은 위에서 시작 */

    obstacleY =
        -obstacle.offsetHeight;


    gameRunning = true;

    gamePaused = false;


    startTime = Date.now();

    pausedTime = 0;

    totalPausedTime = 0;


    /* 화면에 위치 적용 */

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


/* =========================
   게임 루프
========================= */

function gameLoop() {

    if (!gameRunning) {

        return;

    }


    /* 일시정지 */

    if (gamePaused) {

        requestAnimationFrame(gameLoop);

        return;

    }


    /* 게임 경과 시간 */

    const elapsed =
        Date.now()
        - startTime
        - totalPausedTime;


    /* 남은 시간 */

    const remaining =
        Math.max(
            0,
            Math.ceil(
                (
                    gameTime -
                    elapsed
                ) / 1000
            )
        );


    statusText.textContent =
        "남은 시간: " +
        remaining +
        "초";


    /* 20초 성공 */

    if (elapsed >= gameTime) {

        success();

        return;

    }


    /* =========================
       장애물 이동
    ========================= */

    obstacleY += 5;


    /* 장애물이 화면 아래로 지나가면
       다시 위에서 생성 */

    if (
        obstacleY >
        game.clientHeight
    ) {

        obstacleY =
            -obstacle.offsetHeight;


        obstacleX =
            Math.floor(
                Math.random() *
                (
                    game.clientWidth -
                    obstacle.offsetWidth
                )
            );


        obstacle.style.left =
            obstacleX + "px";

    }


    obstacle.style.top =
        obstacleY + "px";


    /* 충돌 검사 */

    checkCollision();


    if (gameRunning) {

        requestAnimationFrame(gameLoop);

    }

}


/* =========================
   충돌 검사
========================= */

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


/* =========================
   게임 오버
========================= */

function gameOver() {

    gameRunning = false;

    gamePaused = false;


    statusText.textContent =
        "GAME OVER 💥";


    pauseButton.textContent =
        "일시정지";

}


/* =========================
   성공
========================= */

function success() {

    gameRunning = false;

    gamePaused = false;


    statusText.textContent =
        "SUCCESS! 🚀";


    pauseButton.textContent =
        "일시정지";

}


/* =========================
   일시정지 / 재개
========================= */

function togglePause() {

    if (!gameRunning) {

        return;

    }


    /* 일시정지 */

    if (!gamePaused) {

        gamePaused = true;

        pausedTime = Date.now();


        statusText.textContent =
            "PAUSED";


        pauseButton.textContent =
            "재개";

    }


    /* 재개 */

    else {

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


/* =========================
   키보드 입력
========================= */

document.addEventListener(
    "keydown",
    function(event) {


        /* R = 재시작 */

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


        /* 게임 중이 아니거나
           일시정지 상태면 무시 */

        if (
            !gameRunning ||
            gamePaused
        ) {

            return;

        }


        /* 키 자동 반복 방지 */

        if (event.repeat) {

            return;

        }


        const maxPlayerX =
            getMaxPlayerX();


        /* 왼쪽 */

        if (
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();


            playerX -= 20;


            if (playerX < 0) {

                playerX = 0;

            }


            player.style.left =
                playerX + "px";

        }


        /* 오른쪽 */

        if (
            event.key === "ArrowRight"
        ) {

            event.preventDefault();


            playerX += 20;


            if (
                playerX >
                maxPlayerX
            ) {

                playerX =
                    maxPlayerX;

            }


            player.style.left =
                playerX + "px";

        }

    }
);


/* =========================
   일시정지 버튼
========================= */

pauseButton.addEventListener(
    "click",
    function() {

        togglePause();

    }
);


/* =========================
   시작 버튼
========================= */

startButton.addEventListener(
    "click",
    function() {

        startGame();

    }
);


/* =========================
   화면 크기 변경
========================= */

window.addEventListener(
    "resize",
    function() {

        if (!gameRunning) {

            return;

        }


        /* 플레이어 경계 */

        const maxPlayerX =
            getMaxPlayerX();


        if (
            playerX >
            maxPlayerX
        ) {

            playerX =
                Math.max(
                    0,
                    maxPlayerX
                );


            player.style.left =
                playerX + "px";

        }


        /* 장애물 경계 */

        const maxObstacleX =
            game.clientWidth -
            obstacle.offsetWidth;


        if (
            obstacleX >
            maxObstacleX
        ) {

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


/* =========================
   브라우저 탭 이탈
========================= */

document.addEventListener(
    "visibilitychange",
    function() {

        if (!gameRunning) {

            return;

        }


        /* 다른 탭으로 이동 */

        if (document.hidden) {

            if (!gamePaused) {

                togglePause();

            }

        }


        /* 다시 돌아옴 */

        else {

            if (gamePaused) {

                statusText.textContent =
                    "PAUSED - P키 또는 재개 버튼";

            }

        }

    }
);
