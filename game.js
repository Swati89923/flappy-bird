const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
let countdown = 0;
let countdownTimer = null;
let soundEnabled = true;
let darkTheme = false;

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

// Set image sources
images.bird.src = "bird.png";
images.background.src = "background.png";
images.pipeTop.src = "pipe_top.png";
images.pipeBottom.src = "pipe_bottom.png";

// Sound effects
const sounds = {
    flap: new Audio("jump.wav"),
    point: new Audio("point.wav"),
    hit: new Audio("hit.wav"),
    countdown: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-game-countdown-921.mp3")
};

// Set sound properties
Object.values(sounds).forEach(sound => {
    sound.volume = 0.3;
});

// Start countdown
function startCountdown() {
    countdown = 3;
    playSound("countdown");
    
    countdownTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            playSound("countdown");
        } else {
            clearInterval(countdownTimer);
            gameStarted = true;
        }
    }, 1000);
}

// Game loop
function gameLoop() {
    update();
    render();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

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

    // Draw bird (only if game has started)
    if (gameStarted || countdown > 0) {
        ctx.drawImage(images.bird, bird.x, bird.y, bird.width, bird.height);
    }

    // Draw score
    ctx.fillStyle = darkTheme ? "#fff" : "#000";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High: ${highScore}`, canvas.width - 120, 30);

    // Draw countdown
    if (countdown > 0) {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        ctx.font = "72px Arial";
        ctx.textAlign = "center";
        ctx.strokeText(countdown.toString(), canvas.width/2, canvas.height/2);
        ctx.fillText(countdown.toString(), canvas.width/2, canvas.height/2);
        ctx.textAlign = "left";
    }

    // Draw messages
    if (!gameStarted && countdown === 0) {
        drawCenteredText("Tap to start", 30);
    }

    if (gameOver) {
        drawCenteredText("GAME OVER", 40);
        drawCenteredText(`Score: ${score}`, 30, 50);
        drawCenteredText("Tap to restart", 20, 90);
    }
}

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
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = "center";
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2 + yOffset);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + yOffset);
    ctx.textAlign = "left";
}

function playSound(sound) {
    if (soundEnabled && sounds[sound]) {
        sounds[sound].currentTime = 0;
        sounds[sound].play().catch(e => console.log("Sound error:", e));
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
    countdown = 0;
    pipes.length = 0;
    if (countdownTimer) clearInterval(countdownTimer);
}

// Touch controls
canvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    if (!gameStarted && !gameOver) {
        startCountdown();
    } else if (gameOver) {
        resetGame();
    } else if (gameStarted) {
        bird.velocity = FLAP_STRENGTH;
        playSound("flap");
    }
}, {passive: false});

// Button controls
document.getElementById("soundBtn").addEventListener("click", function() {
    soundEnabled = !soundEnabled;
    this.textContent = `🔊 Sound: ${soundEnabled ? "ON" : "OFF"}`;
    localStorage.setItem("flappySoundEnabled", soundEnabled);
});

document.getElementById("themeBtn").addEventListener("click", function() {
    darkTheme = !darkTheme;
    this.textContent = `🌙 Theme: ${darkTheme ? "Dark" : "Light"}`;
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("flappyDarkTheme", darkTheme);
});

// Keyboard controls
document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        if (!gameStarted && !gameOver) {
            startCountdown();
        } else if (gameOver) {
            resetGame();
        } else if (gameStarted) {
            bird.velocity = FLAP_STRENGTH;
            playSound("flap");
        }
    }
});

// Initialize
if (localStorage.getItem("flappyDarkTheme") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeBtn").textContent = "🌙 Theme: Dark";
}
document.getElementById("soundBtn").textContent = `🔊 Sound: ${localStorage.getItem("flappySoundEnabled") !== "false" ? "ON" : "OFF"}`;
soundEnabled = localStorage.getItem("flappySoundEnabled") !== "false";
darkTheme = localStorage.getItem("flappyDarkTheme") === "true";

// Make sure images are loaded before starting
window.addEventListener("load", function() {
    // Start with reset to ensure proper initialization
    resetGame();
});
