const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRAVITY = 0.5;
const FLAP = -8;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false;
let gameStarted = false;
let countdown = 3;
let isMuted = false;

const birdImg = new Image();
birdImg.src = "bird.png";

const bgImg = new Image();
bgImg.src = "background.png";

const pipeTopImg = new Image();
pipeTopImg.src = "pipe_top.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "pipe_bottom.png";

const jumpSound = new Audio("jump.wav");
const hitSound = new Audio("hit.wav");

const bird = { x: 50, y: 200, width: 40, height: 30, velocity: 0 };
const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;

function resetGame() {
  bird.y = 200;
  bird.velocity = 0;
  score = 0;
  gameOver = false;
  gameStarted = false;
  countdown = 3;
  pipes.length = 0;
  pipes.push({ x: canvas.width, topHeight: Math.random() * 200 + 50 });
  startCountdown();
}

function toggleSound() {
  isMuted = !isMuted;
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

function startCountdown() {
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown === 0) {
      gameStarted = true;
      clearInterval(countdownInterval);
    }
  }, 1000);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !gameOver && gameStarted) {
    bird.velocity = FLAP;
    if (!isMuted) jumpSound.play();
    if (navigator.vibrate) navigator.vibrate(100);
  } else if (e.code === "Enter" && gameOver) {
    resetGame();
  }
});

canvas.addEventListener("touchstart", () => {
  if (!gameOver && gameStarted) {
    bird.velocity = FLAP;
    if (!isMuted) jumpSound.play();
    if (navigator.vibrate) navigator.vibrate(100);
  } else if (gameOver) {
    resetGame();
  }
});

function drawCountdown() {
  ctx.fillStyle = "black";
  ctx.font = "60px sans-serif";
  ctx.fillText(countdown, canvas.width / 2 - 15, canvas.height / 2);
}

function drawStartScreen() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "30px sans-serif";
  ctx.fillText("Press Space to Start", 80, 250);
}

function draw() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    drawStartScreen();
    if (countdown < 3 && countdown > 0) drawCountdown();
    requestAnimationFrame(draw);
    return;
  }

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px sans-serif";
    ctx.fillText("Game Over!", 100, 280);
    ctx.font = "20px sans-serif";
    ctx.fillText("Press Enter to Restart", 100, 320);
    ctx.fillText(`High Score: ${highScore}`, 130, 360);
    return;
  }

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  pipes.forEach((pipe, index) => {
    pipe.x -= 3;
    const bottomY = pipe.topHeight + pipeGap;

    ctx.drawImage(pipeTopImg, pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.drawImage(pipeBottomImg, pipe.x, bottomY, pipeWidth, canvas.height - bottomY);

    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.topHeight || bird.y + bird.height > bottomY)
    ) {
      gameOver = true;
      if (!isMuted) hitSound.play();
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }
      return;
    }

    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      pipe.passed = true;
      score++;
    }

    if (pipe.x === 200) {
      pipes.push({ x: canvas.width, topHeight: Math.random() * 200 + 50 });
    }
  });

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver = true;
    if (!isMuted) hitSound.play();
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
  }

  ctx.fillStyle = "black";
  ctx.font = "24px sans-serif";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`High: ${highScore}`, canvas.width - 120, 30);

  requestAnimationFrame(draw);
}

window.onload = () => {
  resetGame();
  draw();
};
