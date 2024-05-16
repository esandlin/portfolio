var canvas = document.getElementById('pongCanvas');
    var ctx = canvas.getContext('2d');

    var ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      dx: 2,
      dy: -2
    };

    var paddleHeight = 100;
    var paddleWidth = 10;
    var paddle1Y = (canvas.height - paddleHeight) / 2;
    var paddle2Y = (canvas.height - paddleHeight) / 2;
    var paddleSpeed = 7;

    var upPressed = false;
    var downPressed = false;

    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 38) {
        upPressed = true;
      } else if (e.keyCode === 40) {
        downPressed = true;
      }
    });

    document.addEventListener('keyup', function(e) {
      if (e.keyCode === 38) {
        upPressed = false;
      } else if (e.keyCode === 40) {
        downPressed = false;
      }
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

      // Ball collision detection with top and bottom walls
      if (ball.y + ball.dy > canvas.height - ball.radius || ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
      }

      // Ball collision detection with paddles
      if (ball.x + ball.dx < paddleWidth + ball.radius && ball.y > paddle1Y && ball.y < paddle1Y + paddleHeight) {
        ball.dx = -ball.dx;
      } else if (ball.x + ball.dx > canvas.width - paddleWidth - ball.radius && ball.y > paddle2Y && ball.y < paddle2Y + paddleHeight) {
        ball.dx = -ball.dx;
      }

      // Move paddles
      if (upPressed && paddle1Y > 0) {
        paddle1Y -= paddleSpeed;
      } else if (downPressed && paddle1Y < canvas.height - paddleHeight) {
        paddle1Y += paddleSpeed;
      }

      // Move the ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      requestAnimationFrame(draw);
    }

    draw();