var canvas, ctx, player = {},
    field = {},
    enemies = {},
    frame = 0.7,
    score = 0,
    to, gameOn = false, paused = false,
    cpi = Math.PI,
    cpi2 = Math.PI / 2,
    cpi4 = Math.PI / 4,
    cpi3 = cpi + cpi2,
    cpi360 = Math.PI * 2,
    cwidth, cheight,
    fC, fS,
    fakeLimit = (cpi360 * 200) >> 0,
    crosshair = {},
    gameClock = Date.now();

fS = [];
for (var i = -fakeLimit; i < fakeLimit; i++) {
    fS[i] = Math.sin(i / 100);
}
fC = [];
for (var i = -fakeLimit; i < fakeLimit; i++) {
    fC[i] = Math.cos(i / 100);
}
function drawText(params) {
    // params:
    // text: the text of the string to display.
    // color: color of the text (any css format)
    // align: "left", "center", "right"
    // size: must be integer, px of font size.
    // x: (optional) default will be to center for center align
    // y: (optional) default will be to center row
    var defaults = {
        "color": "#fff",
        "align": "center",
        "size": 15,
        "x": cwidth >> 1,
        "y": cheight >> 1
    };
    for(var i in defaults) {
        params[i] = params[i] ? params[i] : defaults[i];
    }
    if(typeof params.text === "undefined" || params.text.length === 0) {
        return false;
    }

    ctx.font = params.size + "px arial";
    var thisTextWidth = ctx.measureText(params.text).width;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(params.x - (thisTextWidth >> 1)- 10, params.y - 8, thisTextWidth + 17, params.size + 18);

    ctx.textAlign = params.align;
    ctx.textBaseline = "top";
    ctx.fillStyle = params.color;
    ctx.fillText(params.text, params.x, params.y);
}

function preResetGame() {

    var centerX = cwidth >> 1;
    var titleY = ~~(cheight * 0.48);
    var pressSpaceY = ~~(cheight * 0.75);

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(centerX - 255, titleY - 88, 510, 106);

    ctx.font = "98px arial";
    ctx.fillStyle = "#538";
    ctx.textAlign = "center";
    ctx.fillText("UNTITLED", centerX, titleY);

    ctx.font = "100px arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#a7f";
    ctx.textAlign = "center";
    ctx.strokeText("UNTITLED", centerX, titleY);

    drawText({
       "text": "Press space to start",
       "y": pressSpaceY - 18
    });
}

function resetGame() {
    score = 0;
    frame = 0.7;
    player = {
        x: ~~ (cwidth / 2),
        y: ~~ (cheight / 2),
        hp: 100,
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        firing: false,
        cooldown: 25,
        bullets: [],
        fireShot: function () {
            this.bullets.push({
                x: this.x,
                y: this.y,
                angle: Math.atan2(crosshair.x - this.x, crosshair.y - this.y)
            });
        },
        logic: function() {
            if (this.moveLeft && this.x > 0 && !this.moveRight) {
                this.x -= 1;
            }
            if (player.moveRight && this.x < field.width && !this.moveLeft) {
                this.x += 1;
            }
            if (this.moveUp && this.y > 0 && !this.moveDown) {
                this.y -= 1;
            }
            if (this.moveDown && this.y < field.height && !this.moveUp) {
                this.y += 1;
            }
            if (this.firing && --this.cooldown === 0) {
                this.fireShot();
                this.cooldown = 25;
            }
            for (var i in this.bullets) {
                var cacheIndex = ~~ (this.bullets[i].angle * 100);
                this.bullets[i].x += fS[cacheIndex] * 3;
                this.bullets[i].y += fC[cacheIndex] * 3;
                for (var j in enemies.enemy) {
                    var size = enemies.enemy[j].size >> 1;
                    if (this.bullets[i] !== undefined && this.bullets[i].x < enemies.enemy[j].x + enemies.enemy[j].size && this.bullets[i].x > enemies.enemy[j].x - enemies.enemy[j].size && this.bullets[i].y < enemies.enemy[j].y + enemies.enemy[j].size && this.bullets[i].y > enemies.enemy[j].y - enemies.enemy[j].size && enemies.enemy[j].hp > 0) {
                        if (!--enemies.enemy[j].hp) {
                            enemies.enemy[j].cooldown = 100;
                            score++;
                        }
                        this.bullets.splice(i, 1);
                    }
                }
                if (this.bullets[i] !== undefined) {
                    if (~~this.bullets[i].x < 0 || ~~this.bullets[i].x > field.width || ~~this.bullets[i].y < 0 || ~~this.bullets[i].y > field.height) {
                        this.bullets.splice(i, 1);
                    }
                }
            }
        },
        render: function() {
            ctx.fillStyle = "#0f0";
            ctx.fillRect(player.x - 4, player.y - 4, 8, 8);
            for (var i in this.bullets) {
                ctx.fillStyle = "rgba(255,255,255,1)";
                ctx.fillRect(~~this.bullets[i].x, ~~this.bullets[i].y, 2, 2);
            }
        }
    };
    enemies = {
        enemy: [],
        behaviors: {
            wanderChase: function(i) {
                var angleToPlayer = Math.atan2(player.x - enemies.enemy[i].x, player.y - enemies.enemy[i].y);
                if (enemies.enemy[i].cooldown < 0) {
                    enemies.enemy[i].angle = angleToPlayer;
                    enemies.enemy[i].cooldown = ~~ (Math.random() * 900) + 300;
                }
                var cacheIndex = ~~ (enemies.enemy[i].angle * 100);
                enemies.enemy[i].x += fS[cacheIndex] * enemies.enemy[i].speed;
                enemies.enemy[i].y += fC[cacheIndex] * enemies.enemy[i].speed;
                enemies.enemy[i].cooldown -= 1;
            },
            chase: function(i) {
                enemies.enemy[i].angle = Math.atan2(player.x - enemies.enemy[i].x, player.y - enemies.enemy[i].y);
                var cacheIndex = ~~ (enemies.enemy[i].angle * 100);
                enemies.enemy[i].x += fS[cacheIndex] * enemies.enemy[i].speed;
                enemies.enemy[i].y += fC[cacheIndex] * enemies.enemy[i].speed;
            },
            wander: function(i) {
                var oldangle = enemies.enemy[i].angle;
                if (enemies.enemy[i].x < 0) {
                    if (enemies.enemy[i].angle < cpi3 && enemies.enemy[i].angle > cpi) {
                        enemies.enemy[i].angle = cpi - (enemies.enemy[i].angle - cpi);
                    }
                    if (enemies.enemy[i].angle > cpi3 && enemies.enemy[i].angle === oldangle) {
                        enemies.enemy[i].angle = cpi360 - enemies.enemy[i].angle;
                    }
                }
                if (enemies.enemy[i].x > field.width) {
                    if (enemies.enemy[i].angle > cpi2 && enemies.enemy[i].angle < cpi && enemies.enemy[i].angle === oldangle) {
                        enemies.enemy[i].angle = cpi + (cpi - enemies.enemy[i].angle);
                    }
                    if (enemies.enemy[i].angle < cpi2 && enemies.enemy[i].angle === oldangle) {
                        enemies.enemy[i].angle = cpi360 - enemies.enemy[i].angle;
                    }
                }
                if (enemies.enemy[i].y < 0) {
                    if (enemies.enemy[i].angle > cpi2 && enemies.enemy[i].angle < cpi && enemies.enemy[i].angle === oldangle) {
                        enemies.enemy[i].angle = cpi2 + (cpi2 - enemies.enemy[i].angle);
                    }
                    if (enemies.enemy[i].angle > cpi && enemies.enemy[i].angle < cpi3 && enemies.enemy[i].angle === oldangle) {
                        enemies.enemy[i].angle = cpi3 + (cpi3 - enemies.enemy[i].angle);
                    }
                }
                if (enemies.enemy[i].y > field.height) {
                    if (enemies.enemy[i].angle > cpi3 && enemies.enemy[i].angle === oldangle) {
                        enemies.enemy[i].angle = cpi3 - (enemies.enemy[i].angle - cpi3);
                    }
                    if (enemies.enemy[i].angle < cpi2 && enemies.enemy[i].angle === oldangle) {
                        enemies.enemy[i].angle = cpi2 + (cpi2 - enemies.enemy[i].angle);
                    }
                }
                var cacheIndex = ~~ (enemies.enemy[i].angle * 100);
                enemies.enemy[i].x += fS[cacheIndex] * enemies.enemy[i].speed;
                enemies.enemy[i].y += fC[cacheIndex] * enemies.enemy[i].speed;
            }            
        },
        types: [
            {
                size: 36,
                speed: 0.18,
                hp: 1,
                color: 'rgba(255,0,0',
                behavior: "wander"
            },
            {
                size: 20,
                speed: 0.52,
                hp: 1,
                color: 'rgba(255,100,0',
                behavior: "wander"
            },
            {
                size: 52,
                speed: 0.12,
                hp: 3,
                color: 'rgba(255,0,120',
                behavior: "chase"
            },
            {
                size: 28,
                speed: 0.42,
                hp: 2,
                color: 'rgba(255,255,0',
                behavior: "wanderChase",
                cooldown: 1000
            },
            {
                size: 22,
                speed: 0.54,
                hp: 1,
                color: 'rgba(0,255,255',
                behavior: "chase"
            },
            {
                size: 42,
                speed: 0.12,
                hp: 5,
                color: 'rgba(255,155,255',
                behavior: "wander"
            }
        ],
        spawnEnemy: function(x, y, type) {
            type = type + "";
            var thisenemy = {
                x: x,
                y: y, 
                angle: Math.atan2(player.x - x, player.y - y)
            };
            for(var i in this.types[type]) {
                thisenemy[i] = thisenemy[i] ? thisenemy[i] : this.types[type][i];
            }
            this.enemy.push(thisenemy);
        },
        logic: function() {
            if (frame > Math.random() * 200) {
                var whichwall = ~~(Math.random() * 4);
                var type = ~~(Math.random() * ~~frame);
                if (type > this.types.length - 1) {
                    type = this.types.length - 1;
                }
                switch (whichwall) {
                case 0:
                    // top wall
                    this.spawnEnemy(~~(Math.random() * field.width), 0, type);
                    break;
                case 1:
                    // bottom wall
                    this.spawnEnemy(~~(Math.random() * field.width), field.height, type);
                    break;
                case 2:
                    // left wall
                    this.spawnEnemy(0, ~~(Math.random() * field.height), type);
                    break;
                case 3:
                    // right wall
                    this.spawnEnemy(field.width, ~~(Math.random() * field.height), type);
                    break;
                }
            }
            for (var i in enemies.enemy) {
                if (this.enemy[i] !== undefined) {
                    if (this.enemy[i].hp > 0) {
                        this.behaviors[this.enemy[i].behavior](i);
                        if (
                            this.enemy[i].x < player.x + (this.enemy[i].size >> 1) && 
                            this.enemy[i].x > player.x - (this.enemy[i].size >> 1) && 
                            this.enemy[i].y < player.y + (this.enemy[i].size >> 1) && 
                            this.enemy[i].y > player.y - (this.enemy[i].size >> 1) && 
                            this.enemy[i].hp > 0
                        ) {
                            clearInterval(to);
                            gameOn = false;
                        }
                    }
                }
            }

        },
        render: function() {
            for (var i in this.enemy) {
                var size = this.enemy[i].size;
                if (this.enemy[i] !== undefined) {
                    if(this.enemy[i].hp > 0) {
                        ctx.fillStyle = this.enemy[i].color + ",1)";
                        ctx.fillRect(~~this.enemy[i].x - (size >> 1), ~~this.enemy[i].y - (size >> 1), size, size);
                    } else {
                        this.enemy[i].cooldown -= 1;
                        if (this.enemy[i].cooldown < 0) {
                            this.enemy.splice(i, 1);
                        }
                        else {
                            ctx.fillStyle = this.enemy[i].color + "," + (this.enemy[i].cooldown / 100).toFixed(2) + ")";
                            size += ~~ (size * ((100 - this.enemy[i].cooldown) / 100));
                            ctx.fillRect(~~this.enemy[i].x - (size >> 1), ~~this.enemy[i].y - (size >> 1), size, size);
                        }
                    }
                }
            }
        }
    };
}



function fail() {
    //alert('The evil square ate you. :(\nYour score was ' + score);
    preResetGame();
}

$(document).ready(function () {

    cwidth = $("#gamecanvas").width();
    cheight = $("#gamecanvas").height();

    $("#bgimg").load(function () {
        field.bgimg = document.getElementById('bgimg');
    });

    canvas = document.getElementById('gamecanvas');
    ctx = canvas.getContext("2d");
    canvas.setAttribute('width', cwidth);
    canvas.setAttribute('height', cheight);

    field = {
        width: cwidth,
        height: cheight,
        offset: $("#gamecanvas").offset(),
        image: 'gravel.png',
        render: function() {
            if (this.bgimg != '') {
                ctx.drawImage(this.bgimg, 0, 0);
            }
            else {
                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, this.width, this.height);
            }
        }
    };

    crosshair = {
        x: 0,
        y: 0,
        render: function() {
            ctx.strokeStyle = "#0ff";
            ctx.strokeRect(crosshair.x - 4, crosshair.y - 4, 8, 8);
        }
    };

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cwidth, cheight);

    $(document).mousemove(function (event) {
        crosshair.x = event.pageX - field.offset.left;
        crosshair.y = event.pageY - field.offset.top;
    });
    $(document).mousedown(function (event) {
        player.fireShot();
        player.firing = true;
        player.cooldown = 20;
        event.stopPropagation();
        return false;
    });
    $(document).mouseup(function () {
        player.firing = false;
    });
    $(window).keydown(function (event) {
        switch (event.keyCode) {
        case 87:
            player.moveUp = true;
            break;
        case 65:
            player.moveLeft = true;
            break;
        case 68:
            player.moveRight = true;
            break;
        case 83:
            player.moveDown = true;
            break;
        case 32:
            if (!gameOn) {
                to = window.setInterval(doFrame, 5);
                gameOn = true;
                resetGame();
            } else {
                if(paused) {
                    gameClock = Date.now();
                    to = window.setInterval(doFrame, 5);
                    paused = false;
                } else {
                    drawText({ text: "PAUSED", size: 60, color: "#538" });
                    drawText({ text: "Press space to unpause.", y: (cheight >> 1) + 100  });
                    clearInterval(to);
                    paused = true;
                }
            }
        }
    });
    $(window).keyup(function (event) {
        switch (event.keyCode) {
        case 87:
            player.moveUp = false;
            break;
        case 65:
            player.moveLeft = false;
            break;
        case 68:
            player.moveRight = false;
            break;
        case 83:
            player.moveDown = false;
            break;
        }
    });

    function updateScore() {
        drawText({
            color: "#f0f",
            text: "Score: " + score,
            x: 80,
            y: 30
        });
    }

    function gameLogic() {
        player.logic();
        enemies.logic();
    }

    function renderFrame() {

        field.render();
        enemies.render();
        player.render();
        crosshair.render();
        updateScore();

        if(!gameOn) {
            fail();
        }
    }

    function doFrame() {
        var newGameClock = Date.now();
        frame += ((Date.now() - newGameClock) * 0.01);
        gameClock = newGameClock;
        gameLogic();
        renderFrame();
    }
    preResetGame();
    resetGame();
});