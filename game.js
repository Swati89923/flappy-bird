// game.js - Complete Flappy Bird Clone
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_SPEED = 2;
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;
const PIPE_FREQUENCY = 1500; // ms

// Game state
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameOver = false;
let gameStarted = false;
let soundEnabled = true;
let darkTheme = false;
let lastPipeTime = 0;

// Game objects
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: GRAVITY,
    flap: FLAP_STRENGTH
};

const pipes = [];

// Controls
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Sound effects
const sounds = {
    flap: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3"),
    point: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"),
    hit: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3")
};

// Initialize game
function init() {
    // Set volume
    Object.values(sounds).forEach(sound => sound.volume = 0.3);
    
    // Start game loop
    resetGame();
    gameLoop();
}

// Main game loop
function gameLoop(timestamp) {
    update(timestamp);
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(timestamp) {
    if (!gameStarted || gameOver) return;

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Flap when Space is pressed
    if (keys["Space"] && bird.velocity >= 0) {
        bird.velocity = bird.flap;
        playSound("flap");
    }

    // Generate pipes
    if (timestamp - lastPipeTime > PIPE_FREQUENCY) {
        pipes.push(createPipe());
        lastPipeTime = timestamp;
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;

        // Check collisions
        if (checkCollision(bird, pipes[i])) {
            gameOver = true;
            playSound("hit");
            updateHighScore();
        }

        // Check if passed pipe
        if (!pipes[i].passed && pipes[i].x + PIPE_WIDTH < bird.x) {
            pipes[i].passed = true;
            score++;
            playSound("point");
        }

        // Remove off-screen pipes
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }

    // Check boundaries
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
        playSound("hit");
        updateHighScore();
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = darkTheme ? "#1a2a3a" : "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    ctx.fillStyle = darkTheme ? "#4a7a4a" : "#4CAF50";
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(
            pipe.x, 
            pipe.topHeight + PIPE_GAP, 
            PIPE_WIDTH, 
            canvas.height - pipe.topHeight - PIPE_GAP
        );
    });

    // Draw bird
    ctx.fillStyle = darkTheme ? "#ffcc00" : "#ff0000";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Draw score
    ctx.fillStyle = darkTheme ? "#ffffff" : "#000000";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High: ${highScore}`, canvas.width - 120, 30);

    // Draw messages
    if (!gameStarted) {
        drawCenteredText("Press SPACE to start", 30);
        drawCenteredText("Flap to fly through pipes", 20, 60);
    }

    if (gameOver) {
        drawCenteredText("GAME OVER", 40);
        drawCenteredText(`Score: ${score}`, 30, 50);
        drawCenteredText("Press SPACE to restart", 20, 90);
    }
}

// Helper functions
function createPipe() {
    return {
        x: canvas.width,
        topHeight: Math.random() * (canvas.height - PIPE_GAP - 100) + 50,
        passed: false
    };
}

function checkCollision(bird, pipe) {
    return (
        bird.x < pipe.x + PIPE_WIDTH &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + PIPE_GAP)
    );
}

function drawCenteredText(text, size, yOffset = 0) {
    ctx.font = `${size}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + yOffset);
    ctx.textAlign = "left";
}

function playSound(sound) {
    if (soundEnabled) {
        sounds[sound].currentTime = 0;
        sounds[sound].play();
    }
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyHighScore", highScore);
    }
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    score = 0;
    gameOver = false;
    gameStarted = false;
    pipes.length = 0;
    lastPipeTime = 0;
}

// Handle space key to start/restart game
document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
        } else if (gameOver) {
            resetGame();
        }
    }
});

// Touch support for mobile
canvas.addEventListener("touchstart", () => {
    if (!gameStarted && !gameOver) {
        gameStarted = true;
    } else if (gameOver) {
        resetGame();
    } else if (gameStarted) {
        bird.velocity = bird.flap;
        playSound("flap");
    }
});

// Toggle sound
document.getElementById("soundBtn").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    document.getElementById("soundBtn").textContent = 
        `Sound: ${soundEnabled ? "ON" : "OFF"}`;
});

// Toggle theme
document.getElementById("themeBtn").addEventListener("click", () => {
    darkTheme = !darkTheme;
    document.getElementById("themeBtn").textContent = 
        `Theme: ${darkTheme ? "Dark" : "Light"}`;
    document.body.classList.toggle("dark-mode");
});

// Start the game
init();
