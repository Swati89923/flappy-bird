const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRAVITY = 0.5;
const FLAP = -8;
let score = 0;
let gameOver = false;

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

pipes.push({ x: canvas.width, topHeight: Math.random() * 200 + 50 });

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !gameOver) {
    bird.velocity = FLAP;
    jumpSound.play();
  } else if (e.code === "Enter" && gameOver) {
    location.reload();
  }
});

canvas.addEventListener("touchstart", () => {
  if (!gameOver) {
    bird.velocity = FLAP;
    jumpSound.play();
  } else {
    location.reload();
  }
});

function draw() {
  if (gameOver) return;

  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

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
      hitSound.play();
      showGameOver();
    }

    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      pipe.passed = true;
      score++;
    }

    if (pipe.x === 200) {
      pipes.push({ x: canvas.width, topHeight: Math.random() * 200 + 50 });
    }
  });

  if (bird.y + bird.height > canvas.height) {
    gameOver = true;
    hitSound.play();
    showGameOver();
  }

  ctx.fillStyle = "black";
  ctx.font = "24px sans-serif";
  ctx.fillText(`Score: ${score}`, 10, 30);

  requestAnimationFrame(draw);
}

function showGameOver() {
  ctx.fillStyle = "red";
  ctx.font = "40px sans-serif";
  ctx.fillText("Game Over!", 100, 300);
  ctx.font = "20px sans-serif";
  ctx.fillText("Press Enter to Restart", 100, 340);
}

draw();
