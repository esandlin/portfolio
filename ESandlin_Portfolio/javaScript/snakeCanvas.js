// Define constants
var CANVAS_WIDTH = 400;
var CANVAS_HEIGHT = 400;
var CELL_SIZE = 20;
var INITIAL_LENGTH = 5;
var GAME_SPEED = 100;
// Define directions
var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;
// Initialize variables
var canvas;
var ctx;
var snake;
var food;
var direction;
// Initialize the game
function init() {
	canvas = document.getElementById('snakeCanvas');
	ctx = canvas.getContext('2d');
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	direction = RIGHT;
	snake = [];
	for (var i = 0; i < INITIAL_LENGTH; i++) {
		snake.push({
			x: i,
			y: 0
		});
	}
	generateFood();
	// Start the game loop
	setInterval(gameLoop, GAME_SPEED);
}
// Main game loop
function gameLoop() {
	update();
	draw();
}
// Update game state
function update() {
	// Move the snake
	var head = {
		x: snake[0].x,
		y: snake[0].y
	};
	switch (direction) {
		case UP:
			head.y--;
			break;
		case DOWN:
			head.y++;
			break;
		case LEFT:
			head.x--;
			break;
		case RIGHT:
			head.x++;
			break;
	}
	// Check for collisions
	if (head.x < 0 || head.x >= CANVAS_WIDTH / CELL_SIZE || head.y < 0 || head.y >= CANVAS_HEIGHT / CELL_SIZE || checkCollision(head, snake)) {
		// Game over
		init();
		return;
	}
	// Check for food
	if (head.x === food.x && head.y === food.y) {
		// Grow the snake
		snake.unshift(head);
		generateFood();
	} else {
		// Move the snake
		snake.pop();
		snake.unshift(head);
	}
}
// Generate food at a random position
function generateFood() {
	var x = Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE));
	var y = Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE));
	food = {
		x: x,
		y: y
	};
}
// Draw the game
function draw() {
	// Clear the canvas
	ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	// Draw the snake
	ctx.fillStyle = '#00FF00';
	snake.forEach(function(segment) {
		ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
	});
	// Draw the food
	ctx.fillStyle = '#FF0000';
	ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}
// Check if the snake collides with itself
function checkCollision(head, array) {
	for (var i = 0; i < array.length; i++) {
		if (head.x === array[i].x && head.y === array[i].y) {
			return true;
		}
	}
	return false;
}
// Handle key presses
document.addEventListener('keydown', function(event) {
	switch (event.keyCode) {
		case 38: // Up arrow
			if (direction !== DOWN) {
				direction = UP;
			}
			break;
		case 40: // Down arrow
			if (direction !== UP) {
				direction = DOWN;
			}
			break;
		case 37: // Left arrow
			if (direction !== RIGHT) {
				direction = LEFT;
			}
			break;
		case 39: // Right arrow
			if (direction !== LEFT) {
				direction = RIGHT;
			}
			break;
	}
});
// Start the game
init();