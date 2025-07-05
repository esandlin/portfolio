
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');

    // Positions for two stick figures
    const staticFigure = { x: 100, y: 200, color: 'blue' };
    const movingFigure = { x: 300, y: 200, color: 'red' };

    const moveAmount = 20;

    // Touch coordinates
    let touchStartX = 0;
    let touchStartY = 0;

    // Draw function
    function drawStickFigure(x, y, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;

      // Head
      ctx.beginPath();
      ctx.arc(x, y - 30, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x, y + 20);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(x - 15, y);
      ctx.lineTo(x + 15, y);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x - 10, y + 40);
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x + 10, y + 40);
      ctx.stroke();
    }

    // Redraw canvas
    function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStickFigure(staticFigure.x, staticFigure.y, staticFigure.color);
      drawStickFigure(movingFigure.x, movingFigure.y, movingFigure.color);
    }

    // Touch Handlers
    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });

    canvas.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) {
          movingFigure.x += moveAmount; // swipe right
        } else if (dx < -30) {
          movingFigure.x -= moveAmount; // swipe left
        }
      } else {
        if (dy > 30) {
          movingFigure.y += moveAmount; // swipe down
        } else if (dy < -30) {
          movingFigure.y -= moveAmount; // swipe up
        }
      }

      drawScene();
    });

    // Initial draw
    drawScene();