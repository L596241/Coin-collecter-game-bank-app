// Initialize game variables
let sprite; // Declare sprite variable in the global scope
let coin; // Declare coin variable in the global scope
let pot; // Declare pot variable in the global scope
let rainbow; // Declare rainbow variable in the global scope
let score = 0; // Declare score variable in the global scope
let scoreText; // Declare scoreText variable in the global scope
let countdown = 30; // Declare countdown variable in the global scope
let countdownText; // Declare countdownText variable in the global scope
let gameOverText; // Declare gameOverText variable in the global scope
let speed = 1.7; // Declare speed variable in the global scope
let music;  // Declare music variable in the global scope
let elementStates = {}; // Declare elementStates variable in the global scope
let gameIsActive = false; // Declare gameIsActive variable in the global scope
let lastSpeedIncreaseScore = 0; // Declare lastSpeedIncreaseScore variable in the global scope
let potTimer = 0; // Declare potTimer variable in the global scope
let rainbowTimer = 0; // Declare rainbowTimer variable in the global scope
let rainbowVisibleTimer = 0; // Declare rainbowVisibleTimer variable in the global scope
let retryButton; // Declare retryButton variable in the global scope
let startGameText; // Declare startGameText variable in the global scope
let daily_limit = 500; // Initialize to standard daily savings limit

// Phaser configuration
const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',  // This is the id of the HTML element where you want to display the game
    width: 400,
    height: 400,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    backgroundColor: '#90EE90' // Set background color to green
};

// Fetch initial daily limit when page loads
fetch('/api/daily_limit')
    .then(response => response.json())
    .then(data => {
        daily_limit = data.daily_limit;
        document.getElementById('dailyLimitInput').value = daily_limit;
    });

// Add click event listener to the update button
document.getElementById('updateLimit').addEventListener('click', function() {
    let newLimit = document.getElementById('dailyLimitInput').value;
    fetch('/api/update_daily_limit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'daily_limit': newLimit })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            daily_limit = newLimit;
            alert('Daglig sparegrense oppdatert.');
        } else {
            alert('Velg mellom 0 og 5000 kroner');
        }
    });
});

// Initialize Phaser game
const game = new Phaser.Game(config);

function preload() {
    this.load.image('sprite', '/static/images/sprite.png');
    this.load.image('coin', '/static/images/coin.png');
    this.load.image('pot', '/static/images/pot.png');
    this.load.image('rainbow', '/static/images/rainbow.png');
    this.load.audio('coinSound', '/static/sound/coin.mp3');
    this.load.audio('potSound', '/static/sound/pot.mp3');
    this.load.audio('music', '/static/sound/music.mp3');
    this.load.audio('gameOverWin', '/static/sound/win.mp3');
    this.load.audio('gameOverLoose', '/static/sound/loose.mp3');
    this.load.audio('timeSound', '/static/sound/time.mp3'); // Preload the time sound
}


const canvas = document.querySelector('canvas');
if (canvas) {
  canvas.style.margin = 'auto';
  canvas.style.display = 'block';
}

function create() {
    // Create game elements
    sprite = this.physics.add.image(200, 200, 'sprite').setVisible(false);
    coin = this.physics.add.image(100, 100, 'coin').setVisible(false);
    pot = this.physics.add.image(50, 50, 'pot').setVisible(false);
    rainbow = this.physics.add.image(300, 300, 'rainbow').setVisible(false);
  
    // Add Start Game text
    startGameText = this.add.text(100, 200, 'Start Game', {
        fontSize: '40px',
        fill: '#fff',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 5,
    })
    .setInteractive()
    .on('pointerdown', () => { 
        console.log("Start game clicked");
        startGame(this);  // Pass 'this' to ensure it refers to the Phaser scene
    });

    // Add score and countdown text
    scoreText = this.add.text(30, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 5,
    });
    countdownText = this.add.text(250, 16, 'Time: 30', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 5,
    });
    gameOverText = this.add.text(100, 200, 'Game Over', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 5,
    }).setVisible(false);

    // Load background music
    music = this.sound.add('music'); 

    // Play game over sound
    gameOverWin = this.sound.add('gameOverWin'); // Use gameOverWin from the global scope
    gameOverLoose = this.sound.add('gameOverLoose'); // Use gameOverLoose from the global scope

    // Add collision and overlap logic
    this.physics.add.overlap(sprite, coin, collectCoin, null, this);
    this.physics.add.overlap(sprite, pot, collectPot, null, this);
    this.physics.add.overlap(sprite, rainbow, collectRainbow, null, this);

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys(); // Create cursor keys
    
    // Initialize element states
     elementStates = {
        pot: false,  // false means it's not active, true means it's active and can be collected
        rainbow: false
};        
    
}

function startGame(context) {
    // Hide the "Start Game" text and show game elements
    startGameText.setVisible(false);
    sprite.setVisible(true);
    coin.setVisible(true);

    // Resume the physics engine
    context.physics.resume();

    // Start background music
    music.play({ loop: true });

    // Set the game state to active
    gameIsActive = true;
}

     


function update() {

    if (!gameIsActive) return;

    if (score - lastSpeedIncreaseScore >= 5) {  
        speed = Math.min(speed + 0.03, 3);  // Increase speed by 0.03 units, up to a maximum of 3
        lastSpeedIncreaseScore = score;  // Update the last score at which speed was increased
        console.log(`Speed increased to ${speed}`);
    }
    
    if (!gameIsActive) return;
    // Movement logic
    if (this.cursors.left.isDown) {
        sprite.x -= speed;
    }
    if (this.cursors.right.isDown) {
        sprite.x += speed;
    }
    if (this.cursors.up.isDown) {
        sprite.y -= speed;
    }
    if (this.cursors.down.isDown) {
        sprite.y += speed;
    }



    // Boundary logic
const boundaryOffset = -5; // The sprite can go 5 pixels outside the game area.

// Horizontal boundary
if (sprite.x < boundaryOffset) {
    sprite.x = boundaryOffset;
} else if (sprite.x > config.width - boundaryOffset) {
    sprite.x = config.width - boundaryOffset;
}

// Vertical boundary
if (sprite.y < boundaryOffset) {
    sprite.y = boundaryOffset;
} else if (sprite.y > config.height - boundaryOffset) {
    sprite.y = config.height - boundaryOffset;
}


    // Countdown logic
    countdown -= 1 / 60;
    countdownText.setText('Time: ' + Math.ceil(countdown));

    
  // Game over logic
if (countdown <= 0 || score >= 200) {
    // Cap the countdown at zero
    countdown = Math.max(countdown, 0);
    countdownText.setText('Time: ' + Math.ceil(countdown));

    gameOverText.setVisible(true);
    this.physics.pause();
    sprite.setTint(0xff0000);
    music.stop();
    gameIsActive = false; // Set the game state to inactive

    if (score === 0) {
        gameOverLoose.play();
        let endMessage = this.add.text(120, 280, 'Du samlet 0 kr. \nVil du prøve igjen?', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3,
        });
        let retryButton = this.add.text(150, 350, 'Prøv igjen', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3,
        })
            .setInteractive()
            .on('pointerdown', () => window.location.reload());
    } else {
        gameOverWin.play();
        congratulationsText = this.add.text(120, 280, `Gratulerer,\ndu har spart\n${score} kroner! :)`, {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 3,
        });

        setTimeout(function () {
            // Fetch today's total transfers
            fetch('/api/todays_transfers')
            .then(response => response.json())
            .then(data => {
                const totalSum = data.total_sum;
                const gameScore = score; // Assuming 'score' holds the game score
               

        // Check if the daily limit will be exceeded
        if (totalSum + gameScore > daily_limit) {
            alert('Maksimum daglige sparing vil bli overskredet, så transaksjonen kan ikke gjøres.');
            window.location.href = '/account_overview'; // Redirect to account overview
            return;  // Immediately return to stop the execution of the remaining code
        }
        
                    // Show the confirmation popup
                    let transferConfirmed = window.confirm(`Spillet er over. Du samlet ${gameScore} kr. Ønsker du å overføre dette beløpet til din sparekonto?`);
                    if (transferConfirmed) {
                        // Execute the score transfer
                        fetch('/transfer_score', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 'score': gameScore })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                window.location.href = '/account_overview'; // Redirect to account overview
                            } else {
                                alert('En feil har skjedd. Transaksjonen ble ikke fullført. Vennligst prøv på nytt.');
                                window.location.href = '/account_overview'; // Redirect to account overview
                            }
                        });
                    } else {
                        window.location.href = '/account_overview'; // Redirect to account overview
                    }
                });
        }, 2000); // Delay for 2 seconds
    }
}
      

    // Logic for spawning pot
    potTimer += 1;
    if (potTimer >= 300) {  // 300 frames (about 5 seconds)
        potTimer = 0;

        let potX, potY;
        do {
            potX = Phaser.Math.Between(20, 380);
            potY = Phaser.Math.Between(20, 380);
        } while (Phaser.Math.Distance.Between(potX, potY, sprite.x, sprite.y) < 100);

        pot.setVisible(true);
        pot.x = potX;
        pot.y = potY;
        elementStates.pot = true;  // Activate the pot
    }

    // Logic for making pot disappear
    if (elementStates.pot) {  // Only increment timer if pot is active
        potTimer += 1;
        if (potTimer >= 360) {  // 360 frames (about 6 seconds)
            pot.setVisible(false);
            elementStates.pot = false;  // Deactivate the pot
            potTimer = 0;  // Reset the timer
        }
    }

    // Logic for spawning rainbow
    rainbowTimer += 1;
    if (rainbowTimer >= 500) {  // 500 frames (about 8 seconds)
        rainbowTimer = 0;
        rainbowVisibleTimer = 0;  // Reset the visibility timer when the rainbow is spawned

        let rainbowX, rainbowY;
        do {
            rainbowX = Phaser.Math.Between(20, 380);
            rainbowY = Phaser.Math.Between(20, 380);
        } while (Phaser.Math.Distance.Between(rainbowX, rainbowY, sprite.x, sprite.y) < 100);

        rainbow.setVisible(true);
        rainbow.x = rainbowX;
        rainbow.y = rainbowY;
        elementStates.rainbow = true;  // Activate the rainbow
    }

    // Logic for making rainbow disappear
    if (elementStates.rainbow) {  // Only increment timer if rainbow is active
        rainbowVisibleTimer += 1;
        if (rainbowVisibleTimer >= 180) {  // 180 frames (about 3 seconds)
            rainbow.setVisible(false);
            elementStates.rainbow = false;  // Deactivate the rainbow
            rainbowVisibleTimer = 0;  // Reset the timer
        }
    }
}    

function collectCoin(sprite, coin) {
    coin.x = Phaser.Math.Between(20, 380);
    coin.y = Phaser.Math.Between(20, 380);
    score += 1;
    score = Math.min(score, 200);  // Cap the score at 200
    scoreText.setText('Score: ' + score);
    this.sound.play('coinSound');
}


// The collectPot function
function collectPot(sprite, pot) {
    if (elementStates.pot) {  // Check if the pot is active
        // Modify the hitbox size for collecting pot
        const potHitboxSize = 120; // Adjust this value as needed
        const potCenterX = pot.x + pot.displayWidth / 2;
        const potCenterY = pot.y + pot.displayHeight / 2;
        const spriteCenterX = sprite.x + sprite.displayWidth / 2;
        const spriteCenterY = sprite.y + sprite.displayHeight / 2;

        // Check if the sprite is close enough to the pot to collect it
        if (
            Math.abs(potCenterX - spriteCenterX) < potHitboxSize / 2 &&
            Math.abs(potCenterY - spriteCenterY) < potHitboxSize / 2
        ) {
            pot.setVisible(false);
            score += 5;
            score = Math.min(score, 200);
            scoreText.setText('Score: ' + score);
            this.sound.play('potSound');
            elementStates.pot = false;  // Deactivate the pot so it doesn't keep giving bonuses
        }
    }
}

// The collectRainbow function
function collectRainbow(sprite, rainbow) {
    if (elementStates.rainbow) {  // Check if the rainbow is active
        // Modify the hitbox size for collecting rainbow
        const rainbowHitboxSize = 120; // Adjust this value as needed
        const rainbowCenterX = rainbow.x + rainbow.displayWidth / 2;
        const rainbowCenterY = rainbow.y + rainbow.displayHeight / 2;
        const spriteCenterX = sprite.x + sprite.displayWidth / 2;
        const spriteCenterY = sprite.y + sprite.displayHeight / 2;

        // Check if the sprite is close enough to the rainbow to collect it
        if (
            Math.abs(rainbowCenterX - spriteCenterX) < rainbowHitboxSize / 2 &&
            Math.abs(rainbowCenterY - spriteCenterY) < rainbowHitboxSize / 2
        ) {
            rainbow.setVisible(false);
            countdown += 7;
            elementStates.rainbow = false;  // Deactivate the rainbow so it doesn't keep giving bonuses

            // Play the "timeSound" when the rainbow is collected
            this.sound.play('timeSound');
        }
    }
}

fetch('/api/todays_transfers')
    .then(response => response.json())
    .then(data => {
        console.log("Data from /api/todays_transfers:", data);
    });
