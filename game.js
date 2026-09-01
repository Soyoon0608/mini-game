const game = document.getElementById("game");
const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const statusText = document.getElementById("status");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");


/* =========================================
   게임 상태
========================================= */

let playerX = 0;
let obstacleX = 100;
let obstacleY = -40;

let gameRunning = false;
let gamePaused = false;

let startTime = 0;
let pausedTime = 0;
let totalPausedTime = 0;

const gameTime = 20000;


/* =========================================
   과제 3 — 난이도
========================================= */

const OBSTACLE_SPEED = 15;


/* =========================================
   카드 5 — 충돌 효과 설정
========================================= */

/*
   true  : 충돌 시 효과 실행
   false : 충돌 시 효과 실행하지 않음
*/

const EFFECT_ENABLED = true;


/* =========================================
   카드 4 — 저장과 손상 복구
========================================= */

const DEFAULT_SAVE = {
    bestTime: 0
};


/* 저장 데이터 불러오기 */

function loadSave() {

    let saved;

    try {

        saved =
            localStorage.getItem("gameSave");

    } catch (error) {

        return {
            ...DEFAULT_SAVE
        };
    }


    /* C24 — 빈 저장값 */

    if (
        !saved ||
        saved.trim() === ""
    ) {

        return {
            ...DEFAULT_SAVE
        };
    }


    /* C25 — 손상된 저장값 */

    try {

        const data =
            JSON.parse(saved);


        if (
            data === null ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {

            return {
                ...DEFAULT_SAVE
            };
        }


        if (
            typeof data.bestTime !== "number" ||
            !Number.isFinite(data.bestTime) ||
            data.bestTime < 0
        ) {

            return {
                ...DEFAULT_SAVE
            };
        }


        return {
            bestTime: data.bestTime
        };


    } catch (error) {

        return {
            ...DEFAULT_SAVE
        };
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

        console.warn(
            "저장 데이터를 저장할 수 없습니다."
        );
    }
}


/* 현재 저장 데이터 */

let saveData = loadSave();


/* =========================================
   화면 크기 계산
========================================= */

function getMaxPlayerX() {

    return (
        game.clientWidth -
        player.offsetWidth
    );
}


/* =========================================
   카드 5 — 충돌 효과
========================================= */

function playGameOverEffect() {

    /*
       C27
       효과 설정이 꺼져 있으면 실행하지 않음
    */

    if (!EFFECT_ENABLED) {

        return;
    }


    /*
       기존 효과 제거
       → 효과가 계속 누적되는 것을 방지
    */

    game.classList.remove(
        "game-effect"
    );


    /*
       브라우저가 이전 애니메이션을
       다시 계산하도록 함
    */

    void game.offsetWidth;


    /*
       충돌 효과 실행
    */

    game.classList.add(
        "game-effect"
    );


    /*
       0.5초 후 효과 종료
    */

    setTimeout(
        function() {

            game.classList.remove(
                "game-effect"
            );

        },
        500
    );
}


/* =========================================
   게임 시작
========================================= */

function startGame() {

    /*
       C22
       새 게임 시작 시
       현재 판 값을 초기화
    */


    /* 플레이어 위치 초기화 */

    playerX =
        (
            game.clientWidth -
            player.offsetWidth
        ) / 2;


    /* 장애물 위치 초기화 */

    obstacleX =
        Math.floor(
            Math.random() *
            (
                game.clientWidth -
                obstacle.offsetWidth
            )
        );


    /* 장애물 위쪽에서 시작 */

    obstacleY =
        -obstacle.offsetHeight;


    /* 게임 상태 초기화 */

    gameRunning = true;

    gamePaused = false;


    /* 시간 초기화 */

    startTime = Date.now();

    pausedTime = 0;

    totalPausedTime = 0;


    /* 화면 초기화 */

    player.style.left =
        playerX + "px";

    obstacle.style.left =
        obstacleX + "px";

    obstacle.style.top =
        obstacleY + "px";


    /* 효과가 남아 있다면 제거 */

    game.classList.remove(
        "game-effect"
    );


    /* 상태 표시 */

    statusText.textContent =
        "남은 시간: 20초";


    pauseButton.textContent =
        "일시정지";


    /* 게임 시작 */

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================
   게임 루프
========================================= */

function gameLoop() {

    if (!gameRunning) {

        return;
    }


    /* 일시정지 */

    if (gamePaused) {

        requestAnimationFrame(
            gameLoop
        );

        return;
    }


    /* 경과 시간 */

    const elapsed =
        Date.now() -
        startTime -
        totalPausedTime;


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


    /* 20초 생존 성공 */

    if (
        elapsed >= gameTime
    ) {

        success();

        return;
    }


    /* 장애물 이동 */

    obstacleY +=
        OBSTACLE_SPEED;


    /* 장애물이 화면 아래로 내려간 경우 */

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

        requestAnimationFrame(
            gameLoop
        );
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
        playerLeft <
        obstacleRight &&

        playerRight >
        obstacleLeft &&

        playerTop <
        obstacleBottom &&

        playerBottom >
        obstacleTop
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


    /*
       C26
       충돌 사건에서만 효과 실행
    */

    playGameOverEffect();
}


/* =========================================
   성공
========================================= */

function success() {

    gameRunning = false;

    gamePaused = false;


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
       최고 기록 보존
    */

    if (
        survivedSeconds >
        saveData.bestTime
    ) {

        saveData.bestTime =
            survivedSeconds;

        saveGame(
            saveData
        );
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

        pausedTime =
            Date.now();


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


/* =========================================
   일시정지 버튼
========================================= */

pauseButton.addEventListener(
    "click",
    function() {

        togglePause();
    }
);


/* =========================================
   게임 시작 버튼
========================================= */

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


/* =========================================
   탭 전환 시 자동 일시정지
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
