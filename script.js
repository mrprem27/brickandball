var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;
let ctx = canvas.getContext('2d');

const GAME_WIDTH = window.innerWidth - 4;
const GAME_HEIGHT = window.innerHeight - 6;
const GAMESTATE = {
    paused: 0,
    run: 1,
    menu: 2,
    gameover: 3,
    newlvl:4
}
class GAME {
    constructor(GAME_WIDTH, GAME_HEIGHT) {
        this.gameWidth = GAME_WIDTH;
        this.gameobjects = [];
        this.bricks = [];
        this.levels=[level1,level2];
        this.currentlvl=0;
        this.gameHeight = GAME_HEIGHT;
        this.paddle = new Paddle(this);
        this.gamestate = GAMESTATE.menu;
        this.ball = new Ball(this);
        this.lives = 4;
        new inputhandler(this.paddle, this);
    }
    start() {
        if (this.gamestate !== GAMESTATE.menu&&this.gamestate !== GAMESTATE.newlvl)
        return;
        this.bricks = buildlevel(this,this.levels[this.currentlvl]);
        this.ball.reset();
        this.gameobjects = [this.ball, this.paddle];
        this.gamestate = GAMESTATE.run;
    }
    draw(ctx) {
        [...this.gameobjects,...this.bricks].forEach((object) => object.draw(ctx));
        if (this.gamestate == GAMESTATE.paused) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(200, 200, 200, 0.181)";
            ctx.fill();
            ctx.font = "50px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(" || Paused lives-remaining:" + this.lives, this.gameWidth / 2, this.gameHeight / 2);
        }
        else if (this.gamestate == GAMESTATE.menu) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0, 0, 0,1)";
            ctx.fill();
            ctx.font = "50px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(" PRESS SPACEBAR TO START and use esc button to pause the game", this.gameWidth / 2, this.gameHeight / 2);
        }
        else if (this.gamestate == GAMESTATE.gameover) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0, 0, 0,1)";
            ctx.fill();
            ctx.font = "50px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER!!", this.gameWidth / 2, this.gameHeight / 2);
        }
    }
    update(deltatime) {
        if (this.lives === 0)
            this.gamestate = GAMESTATE.gameover;
        if (this.gamestate === GAMESTATE.paused || this.gamestate === GAMESTATE.menu || this.gamestate === GAMESTATE.gameover)
            return;
            if(this.bricks.length===0)
            {
                this.currentlvl++;
                this.gamestate = GAMESTATE.newlvl;
                this.start();
            }
        [...this.gameobjects, ...this.bricks].forEach((object) => object.update(deltatime));

       this.bricks = this.bricks.filter(brick => !brick.markedfdel);
    }
    togglepaused() {
        if (this.gamestate == GAMESTATE.paused)
            this.gamestate = GAMESTATE.run;
        else
            this.gamestate = GAMESTATE.paused;
    }
}
class Paddle {
    constructor(game) {
        this.width = game.gameWidth / 8;
        this.height = 20;
        this.maxspeed =4;
        this.speed = 0;
        this.position = {
            x: game.gameWidth / 2 - this.width / 2,
            y: game.gameHeight - this.height - 10,
        }
    }
    draw(ctx) {
        ctx.fillStyle = "#0A7"
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    moveleft() {
        this.speed = -this.maxspeed;
    }
    moveright() {
        this.speed = this.maxspeed;
    }
    stop() {
        this.speed = 0;
    }
    update(delatime) {
        this.position.x += this.speed;
        if (this.position.x < 0)
            this.position.x = 0;
        if (this.position.x > GAME_WIDTH - this.width)
            this.position.x = GAME_WIDTH - this.width;
    }
}
class inputhandler {
    constructor(paddle, game) {
        document.addEventListener('keydown', event => {
            switch (event.keyCode) {
                case 37:
                    paddle.moveleft();
                    break;
                case 39:
                    paddle.moveright();
                    break;
                case 27:
                    game.togglepaused();
                    break;
                case 32:
                    game.start();
                    break;
                default:
                    break;
            }
        });
         document.addEventListener('keyup', event => {
            switch (event.keyCode) {
                case 37:
                    if (paddle.speed < 0)
                        paddle.stop();
                    break;
                case 39:
                    if (paddle.speed > 0)
                        paddle.stop();
                    break;
                default:
                    break;
            }
        });
    }
}
class Ball {
    constructor(game) {
        this.speed = { x: 2, y: 2 };
        this.size = 25;
        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;
        this.game = game;
        this.position = {
            x: Math.random() * (840 - this.size - 350) + this.size + 350, y: (Math.random() * (GAME_HEIGHT - 350) + 250)
        }
        this.image = document.getElementById('ball');
    }
    reset(){
        this.position = {
            x: Math.random() * (840 - this.size - 350) + this.size + 350, y: (Math.random() * (GAME_HEIGHT - 350) + 250)
        }
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size)
    }
    update(deltatime) {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y
        if (this.position.x + this.size + 4 > this.gameWidth || this.position.x + 3.6 < 0)
            this.speed.x = -this.speed.x;
        if (this.position.y + this.size + 3 > this.gameHeight || this.position.y < 0)
            this.speed.y = -this.speed.y;
        if (this.position.y + this.size + 3 > this.gameHeight) {
            this.game.lives--;
            this.reset();
            this.game.gamestate = GAMESTATE.paused;
        }
        if (detectcollision(this, this.game.paddle)) {
            this.speed.y = -this.speed.y;
            this.position.y = this.game.paddle.position.y - this.size;
        }
    }
}
class Brick {
    constructor(game, position) {
        this.width = 70;
        this.height = 35;
        this.game = game;
        this.position = position;
        this.image = document.getElementById('brick');
        this.markedfdel = false;
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        if (detectcollision(this.game.ball, this)) {
            this.game.ball.speed.y = -this.game.ball.speed.y;
            this.markedfdel = true;
        }
    }
}
//levels
const level1 = [
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const level2 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function buildlevel(game, level) {
    let bricks = [];
    level.forEach((row, rowindex) => {
        row.forEach((brick, brickindex) => {
            if (brick === 1) {
                let position = {
                    x: 70 * brickindex, y: 50 + 35 * rowindex
                };
                bricks.push(new Brick(game, position))
            }
        })
    })
    return bricks;
}

function detectcollision(ball, gameobject) {
    let bottomfball = ball.position.y + ball.size;
    let topfball = ball.position.y;
    let topfgameobject = gameobject.position.y;
    let leftfgameobject = gameobject.position.x;
    let rightfgameobject = gameobject.position.x + gameobject.width;
    let bottomfgameobject = gameobject.position.y + gameobject.height;
    if (bottomfball >= topfgameobject &&
        topfball <= bottomfgameobject && ball.position.x + ball.size >= leftfgameobject && ball.position.x <= rightfgameobject)
        return true;
    return false;
}















let game = new GAME(GAME_WIDTH, GAME_HEIGHT);
ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
let lasttime = 0;
function gameloop(timestamp) {
    let deltatime = timestamp - lasttime;
    lasttime = timestamp;
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    game.update(deltatime);
    game.draw(ctx);
    requestAnimationFrame(gameloop);
}

requestAnimationFrame(gameloop);
