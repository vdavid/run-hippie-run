// Variables for game objects and images
let player, playerImg;
const chasers = [];
let chaserImg;
let score = 0;

// Settings
const playerSpeed = 2;
const chaserSpeed = 1;

// Game area
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
playerImg = new Image();
playerImg.src = 'player.svg';

chaserImg = new Image();
chaserImg.src = 'romanian.svg';

// Create player
player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 50
};

// Create chasers
for (let i = 0; i < 3; i++) {
    chasers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 30,
        height: 50
    });
}

// Listen for keydown events
window.addEventListener('keydown', function (event) {
    switch (event.key) {
        case "ArrowUp": player.y -= playerSpeed; break;
        case "ArrowDown": player.y += playerSpeed; break;
        case "ArrowLeft": player.x -= playerSpeed; break;
        case "ArrowRight": player.x += playerSpeed; break;
    }
});

// Update game objects
function update() {
    // Update chasers
    for (let i = 0; i < chasers.length; i++) {
        const chaser = chasers[i];

        // Move towards player
        const dx = player.x - chaser.x;
        const dy = player.y - chaser.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        chaser.x += dx / distance * chaserSpeed;
        chaser.y += dy / distance * chaserSpeed;

        // Check collision with player
        if (Math.abs(player.x - chaser.x) < player.width && Math.abs(player.y - chaser.y) < player.height) {
            console.log('Game Over!'); // Replace this with a proper game over mechanic
            score = 0; // Reset score
        }
    }

    // Increase score
    score += 0.1;
}

// Render game objects
function render() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw chasers
    for (let i = 0; i < chasers.length; i++) {
        const chaser = chasers[i];
        ctx.drawImage(chaserImg, chaser.x, chaser.y, chaser.width, chaser.height);
    }

    // Draw score
    ctx.fillStyle = "#000000"; // Black
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + Math.round(score), 10, 30);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
