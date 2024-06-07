// Get the canvas element and its context
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
// Define the player object
var player = {
	x: canvas.width / 2,
	y: canvas.height - 30,
	width: 50,
	height: 50,
	speed: 5,
	color: "#000",
	draw: function() {
		ctx.beginPath();
		ctx.rect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}
};
// Define key event listeners
document.addEventListener("keydown", function(event) {
	if (event.key === "ArrowRight") {
		player.x += player.speed;
	} else if (event.key === "ArrowLeft") {
		player.x -= player.speed;
	} else if (event.key === "ArrowUp") {
		player.y -= player.speed;
	} else if (event.key === "ArrowDown") {
		player.y += player.speed;
	}
});
// Main game loop
function draw() {
	// Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Draw the player
	player.draw();
	// Request to run the draw function again
	requestAnimationFrame(draw);
}
// Start the game loop
draw();