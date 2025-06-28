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
let highScore = 0;
let gameOver = false;
let gameStarted = false;
let soundEnabled = true;
let darkTheme = false;

// Game objects
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,
    color: "#FF0000" // Fallback color
};

const pipes = [];

// Image handling with fallbacks
const images = {
    bird: {
        img: new Image(),
        loaded: false,
        src: "bird.png",
        fallbackColor: "#FF0000" // Red fallback
    },
    background: {
        img: new Image(),
        loaded: false,
        src: "background.png",
        fallbackColor: "#70c5ce" // Blue fallback
    },
    pipeTop: {
        img: new Image(),
        loaded: false,
        src: "pipe_top.png",
        fallbackColor: "#4CAF50" // Green fallback
    },
    pipeBottom: {
        img: new Image(),
        loaded: false,
        src: "pipe_bottom.png",
        fallbackColor: "#4CAF50" // Green fallback
    }
};

// Load images with error handling
Object.keys(images).forEach(key => {
    images[key].img.onload = () => {
        images[key].loaded = true;
        console.log(`${key} image loaded`);
    };
    images[key].img.onerror = () => {
        console.log(`Failed to load ${key} image`);
        images[key].loaded = false;
    };
    images[key].img.src = images[key].src;
});

// Game loop
function gameLoop() {
    update();
    render();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (image or fallback)
    if (images.background.loaded) {
        ctx.drawImage(images.background.img, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = images.background.fallbackColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw pipes (image or fallback)
    pipes.forEach(pipe => {
        if (images.pipeTop.loaded) {
            ctx.drawImage(images.pipeTop.img, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        } else {
            ctx.fillStyle = images.pipeTop.fallbackColor;
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        }

        if (images.pipeBottom.loaded) {
            ctx.drawImage(images.pipeBottom.img, pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.topHeight - PIPE_GAP);
        } else {
            ctx.fillStyle = images.pipeBottom.fallbackColor;
            ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.topHeight - PIPE_GAP);
        }
    });

    // Draw bird (image or fallback)
    if (images.bird.loaded) {
        ctx.drawImage(images.bird.img, bird.x, bird.y, bird.width, bird.height);
    } else {
        ctx.fillStyle = images.bird.fallbackColor;
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        console.log("Using fallback bird");
    }

    // Draw score
    ctx.fillStyle = "#000";
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

// Rest of your game code remains the same...
// (keep all your existing update(), createPipe(), event listeners, etc.)
