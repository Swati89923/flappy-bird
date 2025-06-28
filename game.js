// game.js - Final Working Version
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
function resizeCanvas() {
    const maxWidth = 400;
    const maxHeight = 600;
    const scale = Math.min(
        window.innerWidth / maxWidth,
        window.innerHeight / maxHeight
    );
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    canvas.style.width = (maxWidth * scale) + "px";
    canvas.style.height = (maxHeight * scale) + "px";
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Game settings
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_SPEED = 2;
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;

// Game state
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameOver = false;
let gameStarted = false;
let soundEnabled = localStorage.getItem("flappySoundEnabled") !== "false";
let darkTheme = localStorage.getItem("flappyDarkTheme") === "true";

// Game objects
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0
};

const pipes = [];

// Load images
const images = {
    bird: new Image(),
    background: new Image(),
    pipeTop: new Image(),
    pipeBottom: new Image()
};

// Set image sources (using your GitHub hosted images)
images.bird.src = "bird.png";
images.background.src = "background.png";
images.pipeTop.src = "pipe_top.png";
images.pipeBottom.src = "pipe_bottom.png";

// Sound effects
const sounds = {
    flap: new Audio(),
    point: new Audio(),
    hit: new Audio()
};

// Initialize sounds (using free sound URLs)
sounds.flap.src = "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3";
sounds.point.src = "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3";
sounds.hit.src = "https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3";

// Set sound properties
Object.values(sounds).forEach(sound => {
    sound.volume = 0.5;
    sound.preload = "auto";
});

// Game loop
function gameLoop() {
    update();
    render();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game state
function update() {
    if (!gameStarted || gameOver) return;

    // Bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

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

    // Generate new pipes
    if (pipes.length === 0 || pipes[pipes.length-1].x < canvas.width - 200) {
        pipes.push(createPipe());
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
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    // Draw pipes
    pipes.forEach(pipe => {
        ctx.drawImage(images.pipeTop, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.drawImage(images.pipeBottom, pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.topHeight - PIPE_GAP);
    });

    // Draw bird
    ctx.drawImage(images.bird, bird.x, bird.y, bird.width, bird.height);

    // Draw score
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High: ${highScore}`, canvas.width - 120, 30);

    // Draw messages
    if (!gameStarted) {
        drawCenteredText("Tap to start", 30);
    }

    if (gameOver) {
        drawCenteredText("GAME OVER", 40);
        drawCenteredText(`Score: ${score}`, 30, 50);
        drawCenteredText("Tap to restart", 20, 90);
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
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = "center";
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2 + yOffset);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + yOffset);
    ctx.textAlign = "left";
}

function playSound(sound) {
    if (soundEnabled && sounds[sound]) {
        try {
            sounds[sound].currentTime = 0;
            sounds[sound].play().catch(e => console.log("Sound play prevented:", e));
        } catch (e) {
            console.log("Sound error:", e);
        }
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
}

// Touch controls
canvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    if (!gameStarted && !gameOver) {
        gameStarted = true;
        gameLoop();
    } else if (gameOver) {
        resetGame();
    } else {
        bird.velocity = FLAP_STRENGTH;
        playSound("flap");
    }
}, {passive: false});

// Button controls
document.getElementById("soundBtn").addEventListener("click", function() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("flappySoundEnabled", soundEnabled);
    this.textContent = `🔊 Sound: ${soundEnabled ? "ON" : "OFF"}`;
    playSound("flap");
});

document.getElementById("themeBtn").addEventListener("click", function() {
    darkTheme = !darkTheme;
    localStorage.setItem("flappyDarkTheme", darkTheme);
    this.textContent = `🌙 Theme: ${darkTheme ? "Dark" : "Light"}`;
    document.body.classList.toggle("dark-mode");
    playSound("flap");
});

// Initialize theme
if (darkTheme) {
    document.body.classList.add("dark-mode");
    document.getElementById("themeBtn").textContent = "🌙 Theme: Dark";
}
document.getElementById("soundBtn").textContent = `🔊 Sound: ${soundEnabled ? "ON" : "OFF"}`;

// Keyboard controls
document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
            gameLoop();
        } else if (gameOver) {
            resetGame();
        } else {
            bird.velocity = FLAP_STRENGTH;
            playSound("flap");
        }
    }
});

// Start the game
resetGame();
