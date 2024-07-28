// Get the canvas element and its context
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
/**
    Player Struct
*/
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 15,
    dx: 5,
    dy: 5,
    color: 'blue'
};

// Variables 
const obstacles = [];
const obstacleRadius = 15;
const obstacleSpeed = 2;
let obstacleFrequency = 100;
let frameCount = 0;
let gameState = 'start';  // 'start', 'playing', 'gameover'

// Handle key presses
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;

/**

*/
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === 'Up' || e.key === 'ArrowUp') {
        upPressed = true;
    } else if (e.key === 'Down' || e.key === 'ArrowDown') {
        downPressed = true;
    } else if (e.key === 'Enter' && gameState === 'start') {
        gameState = 'playing';
    } else if (e.key === 'Enter' && gameState === 'gameover') {
        resetGame();
    }
});

/**

*/
document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === 'Up' || e.key === 'ArrowUp') {
        upPressed = false;
    } else if (e.key === 'Down' || e.key === 'ArrowDown') {
        downPressed = false;
    }
});

/**

*/
function movePlayer() {
    if (rightPressed && player.x < canvas.width - player.radius) {
        player.x += player.dx;
    }
    if (leftPressed && player.x > player.radius) {
        player.x -= player.dx;
    }
    if (upPressed && player.y > player.radius) {
        player.y -= player.dy;
    }
    if (downPressed && player.y < canvas.height - player.radius) {
        player.y += player.dy;
    }
}

/**

*/
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

/**

*/
function createObstacle() {
    const x = Math.random() * (canvas.width - obstacleRadius * 2) + obstacleRadius;
    obstacles.push({ x, y: 0, radius: obstacleRadius });
}

/**

*/
function drawObstacles() {
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        obstacle.y += obstacleSpeed;
    });
}

/**

*/
function checkCollision() {
    obstacles.forEach(obstacle => {
        const dx = player.x - obstacle.x;
        const dy = player.y - obstacle.y;
        const distance = Math.sqrt(dx * dy + dy * dy);

        if (distance <= player.radius + obstacle.radius) {
            gameState = 'gameover';
        }
    });
}

/**

*/
function drawSplashScreen(text) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

/**

*/
function resetGame() {
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 50;
    obstacles.length = 0;
    frameCount = 0;
    gameState = 'start';
}

/**

*/
function update() {
    if (gameState === 'start') {
        drawSplashScreen('Press Enter to Start');
        requestAnimationFrame(update);
        return;
    }

    if (gameState === 'gameover') {
        drawSplashScreen('Game Over! Press Enter to Restart');
        requestAnimationFrame(update);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    movePlayer();

    if (frameCount % obstacleFrequency === 0) {
        createObstacle();
    }

    drawObstacles();
    checkCollision();

    frameCount++;
    requestAnimationFrame(update);
}

update();