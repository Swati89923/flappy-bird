const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const GRAVITY = 0.5;
const FLAP = -8;
let score = 0;
let highScore = localStorage.getItem("flappyHighScore") || 0;
let gameOver = false;
let gameStarted = false;
let countdown = 0;
let soundEnabled = true;
let darkTheme = false;
let winMessageShown = false;

// Load images
const birdImg = new Image();
birdImg.src = "bird.png";

const bgImg = new Image();
bgImg.src = "background.png";

const darkBgImg = new Image();
darkBgImg.src = "background_dark.png"; // You'll need to create this

const pipeTopImg = new Image();
pipeTopImg.src = "pipe_top.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "pipe_bottom.png";

const darkPipeTopImg = new Image();
darkPipeTopImg.src = "pipe_top_dark.png"; // You'll need to create this

const darkPipeBottomImg = new Image();
darkPipeBottomImg.src = "pipe_bottom_dark.png"; // You'll need to create this

// Load sounds
const jumpSound = new Audio("jump.wav");
const hitSound = new Audio("hit.wav");
const scoreSound = new Audio("score.wav"); // Add this sound file

const bird = { x: 50, y: 200, width: 40, height: 30, velocity: 0 };
const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;

// UI elements
const soundToggle = document.createElement("button");
soundToggle.textContent = "Sound: ON";
soundToggle.style.position = "absolute";
soundToggle.style.top = "10px";
soundToggle.style.left = "10px";
soundToggle.style.zIndex = "100";
document.body.appendChild(soundToggle);

const themeToggle = document.createElement("button");
themeToggle.textContent = "Theme: Light";
themeToggle.style.position = "absolute";
themeToggle.style.top = "10px";
themeToggle.style.left = "100px";
themeToggle.style.zIndex = "100";
document.body.appendChild(themeToggle);

// Event listeners
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = `Sound: ${soundEnabled ? "ON" : "OFF"}`;
});

themeToggle.addEventListener("click", () => {
  darkTheme = !darkTheme;
  themeToggle.textContent = `Theme: ${darkTheme ? "Dark" : "Light"}`;
});

function resetGame() {
  bird.y = 200;
  bird.velocity = 0;
  score = 0;
  gameOver = false;
  gameStarted = false;
  winMessageShown = false;
  pipes.length = 0;
  pipes.push({ x: canvas.width, topHeight: Math.random() * 200 + 50 });
  countdown = 3;
}

function startCountdown() {
  if (countdown > 0) {
    ctx.fillStyle = darkTheme ? "white" : "black";
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(countdown.toString(), canvas.width/2, canvas.height/2);
    ctx.textAlign = "left";
    countdown--;
    setTimeout(startCountdown, 1000);
  } else {
    gameStarted = true;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameStarted && !gameOver) {
      startCountdown();
    } else if (!gameOver) {
      bird.velocity = FLAP;
      if (soundEnabled) jumpSound.play();
      if (navigator.vibrate) navigator.vibrate(50); // Vibration for mobile
    }
  } else if (e.code === "Enter" && gameOver) {
    resetGame();
  }
});

canvas.addEventListener("touchstart", () => {
  if (!gameStarted && !gameOver) {
    startCountdown();
  } else if (!gameOver) {
    bird.velocity = FLAP;
    if (soundEnabled) jumpSound.play();
    if (navigator.vibrate) navigator.vibrate(50); // Vibration for mobile
  } else {
    resetGame();
  }
});

function drawStartScreen() {
  ctx.drawImage(darkTheme ? darkBgImg : bgImg, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = darkTheme ? "white" : "black";
  ctx.font = "28px sans-serif";
  ctx.fillText("Press Space to Start", 80, 250);
  ctx.font = "18px sans-serif";
  ctx.fillText("Tap screen or press SPACE to jump", 65, 290);
  ctx.fillText("Avoid pipes. Press ENTER to restart", 60, 320);
}

function exportScore() {
  // Export as CSV
  const csvContent = "data:text/csv;charset=utf-8,Score\n" + score;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "flappy_score.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Alternative: Export as image
  // const dataURL = canvas.toDataURL("image/png");
  // const link = document.createElement("a");
  // link.download = "flappy_score.png";
  // link.href = dataURL;
  // link.click();
}

function draw() {
  // Clear canvas
  ctx.drawImage(darkTheme ? darkBgImg : bgImg, 0, 0, canvas.width, canvas.height);

  if (!gameStarted && countdown === 0) {
    drawStartScreen();
    requestAnimationFrame(draw);
    return;
  }

  if (gameOver) {
    ctx.fillStyle = darkTheme ? "white" : "black";
    ctx.font = "40px sans-serif";
    ctx.fillText("Game Over!", 100, 250);
    ctx.font = "20px sans-serif";
    ctx.fillText("Press Enter to Restart", 100, 290);
    ctx.fillText(`Score: ${score}`, 130, 330);
    ctx.fillText(`High Score: ${highScore}`, 110, 360);
    
    // Add export button
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(120, 390, 160, 40);
    ctx.fillStyle = "white";
    ctx.font = "18px sans-serif";
    ctx.fillText("Export Score", 140, 415);
    
    // Handle export click
    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 120 && x <= 280 && y >= 390 && y <= 430) {
        exportScore();
      }
    };
    
    return;
  }

  if (countdown > 0) {
    requestAnimationFrame(draw);
    return;
  }

  // Game logic
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  pipes.forEach((pipe, index) => {
    pipe.x -= 3;
    const bottomY = pipe.topHeight + pipeGap;

    ctx.drawImage(
      darkTheme ? darkPipeTopImg : pipeTopImg, 
      pipe.x, 0, pipeWidth, pipe.topHeight
    );
    ctx.drawImage(
      darkTheme ? darkPipeBottomImg : pipeBottomImg, 
      pipe.x, bottomY, pipeWidth, canvas.height - bottomY
    );

    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.topHeight || bird.y + bird.height > bottomY)
    ) {
      gameOver = true;
      if (soundEnabled) hitSound.play();
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappyHighScore", highScore);
      }
    }

    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      pipe.passed = true;
      score++;
      if (soundEnabled) scoreSound.play();
      
      // Win message at score 10
      if (score === 10 && !winMessageShown) {
        winMessageShown = true;
        ctx.fillStyle = darkTheme ? "white" : "black";
        ctx.font = "30px sans-serif";
        ctx.fillText("You Win!", canvas.width/2 - 60, 100);
        setTimeout(() => {}, 1500); // Show message for 1.5 seconds
      }
    }

    if (pipe.x === 200) {
      pipes.push({ x: canvas.width, topHeight: Math.random() * 200 + 50 });
    }
  });

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver = true;
    if (soundEnabled) hitSound.play();
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("flappyHighScore", highScore);
    }
  }

  // Draw score
  ctx.fillStyle = darkTheme ? "white" : "black";
  ctx.font = "24px sans-serif";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`High: ${highScore}`, canvas.width - 120, 30);

  requestAnimationFrame(draw);
}

// Responsive design for mobile
function resizeCanvas() {
  const width = window.innerWidth > 400 ? 400 : window.innerWidth - 20;
  const height = window.innerHeight > 600 ? 600 : window.innerHeight - 20;
  
  canvas.width = width;
  canvas.height = height;
  
  // Adjust bird position on resize
  if (!gameStarted) {
    bird.y = height / 2;
  }
}

window.onload = () => {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  resetGame();
  draw();
};
