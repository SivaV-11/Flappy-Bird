// Flappy Bird Game

// Canvas board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird properties
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Pipes properties
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics properties
let velocityX = -2; // Pipes moving left speed
let velocityY = 0; // Bird jump speed
let gravity = 0.4;

// Game state
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Used for drawing on the board

    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Start game loop
    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // Every 1.5 seconds
    document.addEventListener("keydown", moveBird);

    // Draw initial high score
    drawHighScore();
};

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    // Clear canvas
    context.clearRect(0, 0, board.width, board.height);

    // Bird movement
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity, prevent going above canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y + bird.height > board.height) {
        gameOver = true;
        handleGameOver();
    }

    // Pipes movement
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Scoring
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // Increment score for passing each pipe pair
            pipe.passed = true;
        }

        // Collision detection
        if (detectCollision(bird, pipe)) {
            gameOver = true;
            handleGameOver();
        }
    }

    // Clear off-screen pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Draw score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(`Score: ${Math.floor(score)}`, 5, 45);
    drawHighScore();
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / (4 + score / 10); // Dynamic opening space based on score

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);

    // Limit the number of pipes in the array
    while (pipeArray.length > 10) {
        pipeArray.shift();
    }
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        velocityY = -6; // Jump

        // Reset game if over
        if (gameOver) {
            resetGame();
        }
    }
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width && // A's top-left corner doesn't reach B's top-right corner
        a.x + a.width > b.x && // A's top-right corner passes B's top-left corner
        a.y < b.y + b.height && // A's top-left corner doesn't reach B's bottom-left corner
        a.y + a.height > b.y // A's bottom-left corner passes B's top-left corner
    );
}

function handleGameOver() {
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("GAME OVER", 5, 90);

    // Update high score
    if (score > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem("flappyHighScore", highScore);
    }
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    velocityY = 0;
    gameOver = false;
}

function drawHighScore() {
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(`High Score: ${highScore}`, 5, 75);
}
