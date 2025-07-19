window.onload = function() {
  const canvas = document.getElementById('pongCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    paddle1Y = (canvas.height - paddleHeight) / 2;
    paddle2Y = (canvas.height - paddleHeight) / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
  }

  //window.addEventListener('resize', resizeCanvas);
  //resizeCanvas();

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: 4,
    dy: -4
  };

  const paddleHeight = 100;
  const paddleWidth = 10;
  let paddle1Y = (canvas.height - paddleHeight) / 2;
  let paddle2Y = (canvas.height - paddleHeight) / 2;
  const paddleSpeed = 7;

  let upPressed = false;
  let downPressed = false;

  document.addEventListener('keydown', function(e) {
    if (e.key === "ArrowUp") upPressed = true;
    if (e.key === "ArrowDown") downPressed = true;
  });

  document.addEventListener('keyup', function(e) {
    if (e.key === "ArrowUp") upPressed = false;
    if (e.key === "ArrowDown") downPressed = false;
  });

  let touchStartY = null;

  canvas.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1 && touchStartY !== null) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;

      if (Math.abs(deltaY) > 5) {
        if (deltaY > 0 && paddle1Y < canvas.height - paddleHeight) {
          paddle1Y += paddleSpeed;
        } else if (deltaY < 0 && paddle1Y > 0) {
          paddle1Y -= paddleSpeed;
        }
        touchStartY = touchY;
      }
    }
  });

  canvas.addEventListener('touchend', function() {
    touchStartY = null;
  });

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddles() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddles();

    if (ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    }

    if (ball.x - ball.radius < paddleWidth &&
        ball.y > paddle1Y &&
        ball.y < paddle1Y + paddleHeight) {
      ball.dx = -ball.dx;
      ball.x = paddleWidth + ball.radius;
    } else if (ball.x + ball.radius > canvas.width - paddleWidth &&
               ball.y > paddle2Y &&
               ball.y < paddle2Y + paddleHeight) {
      ball.dx = -ball.dx;
      ball.x = canvas.width - paddleWidth - ball.radius;
    }

    if (upPressed && paddle1Y > 0) paddle1Y -= paddleSpeed;
    if (downPressed && paddle1Y < canvas.height - paddleHeight) paddle1Y += paddleSpeed;

    if (ball.y < paddle2Y + paddleHeight / 2 && paddle2Y > 0) paddle2Y -= paddleSpeed;
    if (ball.y > paddle2Y + paddleHeight / 2 && paddle2Y < canvas.height - paddleHeight) paddle2Y += paddleSpeed;

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw);
  }

  draw();
};
