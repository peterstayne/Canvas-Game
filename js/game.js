;(function() {

var canvas, ctx, player = {},
    field = {},
    canvasScale = 1,
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
    minusClock = 0,
    fpsCount = 0,
    fpsTimer = 0,
    shadowEnabled = true,
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
    if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,0)';

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

    if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,0)';

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(centerX - 255, titleY - 88, 510, 106);

    ctx.font = "98px arial";
    ctx.fillStyle = "#538";
    ctx.textAlign = "center";
    ctx.fillText("SQUARE'D", centerX, titleY);

    ctx.font = "100px arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#a7f";
    ctx.textAlign = "center";
    ctx.strokeText("SQUARE'D", centerX, titleY);

    drawText({
       "text": "Press space to start",
       "y": pressSpaceY - 18
    });
    drawText({
       "text": "Controls: W, A, S, D to move; Mouse to aim and fire",
       "y": pressSpaceY + 18
    });
    gameClock = Date.now();
}

function resetGame() {
    gameClock = Date.now();
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
                this.x -= (0.12 * minusClock);
            }
            if (player.moveRight && this.x < field.width && !this.moveLeft) {
                this.x += (0.12 * minusClock);
            }
            if (this.moveUp && this.y > 0 && !this.moveDown) {
                this.y -= (0.12 * minusClock);
            }
            if (this.moveDown && this.y < field.height && !this.moveUp) {
                this.y += (0.12 * minusClock);
            }
            if (this.firing && (this.cooldown = this.cooldown - (minusClock * 0.2)) <= 0) {
                this.fireShot();
                this.cooldown = 25;
            }
            for (var i in this.bullets) {
                var cacheIndex = ~~ (this.bullets[i].angle * 100);
                this.bullets[i].x += fS[cacheIndex] * (0.5 * minusClock);
                this.bullets[i].y += fC[cacheIndex] * (0.5 * minusClock);
                for (var j in enemies.enemy) {
                    var size = enemies.enemy[j].size >> 1;
                    if (this.bullets[i] !== undefined && this.bullets[i].x < enemies.enemy[j].x + enemies.enemy[j].size && this.bullets[i].x > enemies.enemy[j].x - enemies.enemy[j].size && this.bullets[i].y < enemies.enemy[j].y + enemies.enemy[j].size && this.bullets[i].y > enemies.enemy[j].y - enemies.enemy[j].size && enemies.enemy[j].hp > 0) {
                        if (!--enemies.enemy[j].hp) {
                            enemies.enemy[j].angle = this.bullets[i].angle;
                            enemies.enemy[j].cooldown = 100;
                            score++;
                            enemies.enemy[j].death = {
                                x: this.bullets[i].x,
                                y: this.bullets[i].y
                            };
                        }
                        this.bullets.splice(i, 1);
                        break;
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
            if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,1)';
            if(shadowEnabled) ctx.shadowBlur = 5;
            if(shadowEnabled) ctx.shadowOffsetX = 3;
            if(shadowEnabled) ctx.shadowOffsetY = 3;
            ctx.fillStyle = "#0f0";
            ctx.fillRect(player.x - 4, player.y - 4, 8, 8);

            if(shadowEnabled) ctx.shadowColor = 'rgba(255,255,0,0)';
            ctx.fillStyle = "rgba(255,255,255,1)";
            for (var i in this.bullets) {
                ctx.fillRect(~~this.bullets[i].x, ~~this.bullets[i].y, 3, 3);
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
                enemies.enemy[i].x += fS[cacheIndex] * (enemies.enemy[i].speed * minusClock);
                enemies.enemy[i].y += fC[cacheIndex] * (enemies.enemy[i].speed * minusClock);
                enemies.enemy[i].cooldown -= minusClock;
            },
            chase: function(i) {
                enemies.enemy[i].angle = Math.atan2(player.x - enemies.enemy[i].x, player.y - enemies.enemy[i].y);
                var cacheIndex = ~~ (enemies.enemy[i].angle * 100);
                enemies.enemy[i].x += fS[cacheIndex] * (enemies.enemy[i].speed * minusClock);
                enemies.enemy[i].y += fC[cacheIndex] * (enemies.enemy[i].speed * minusClock);
            },
            wander: function(i) {
                // PI, -PI = up
                // -half PI = left
                // +half PI = right
                // 0 = down
                if(enemies.enemy[i].angle > cpi) enemies.enemy[i].angle -= cpi360;
                if(enemies.enemy[i].angle < -cpi) enemies.enemy[i].angle += cpi360;
                
                var oldangle = enemies.enemy[i].angle;
                if (enemies.enemy[i].x < 0) {
                    if(enemies.enemy[i].angle < 0) enemies.enemy[i].angle = -enemies.enemy[i].angle;
                }
                if (enemies.enemy[i].x > field.width) {
                    if(enemies.enemy[i].angle > 0) enemies.enemy[i].angle = -enemies.enemy[i].angle;
                }
                if (enemies.enemy[i].y < 0) {
                    if(enemies.enemy[i].angle < -cpi2) enemies.enemy[i].angle = -cpi2 + (-cpi2 - enemies.enemy[i].angle);
                    if(enemies.enemy[i].angle > cpi2) enemies.enemy[i].angle = cpi2 + (cpi2 - enemies.enemy[i].angle);
                }
                if (enemies.enemy[i].y > field.height) {
                    if(enemies.enemy[i].angle < 0 && enemies.enemy[i].angle > -cpi2) enemies.enemy[i].angle = -cpi2 + (-cpi2 - enemies.enemy[i].angle);
                    if(enemies.enemy[i].angle > 0 && enemies.enemy[i].angle < cpi2) enemies.enemy[i].angle = cpi2 + (cpi2 - enemies.enemy[i].angle);
                }
                var cacheIndex = ~~ (enemies.enemy[i].angle * 100);
                enemies.enemy[i].x += fS[cacheIndex] * (enemies.enemy[i].speed * minusClock);
                enemies.enemy[i].y += fC[cacheIndex] * (enemies.enemy[i].speed * minusClock);
            }            
        },
        types: [
            {
                size: 36,
                speed: 0.038,
                hp: 1,
                color: 'rgba(255,0,0',
                behavior: "wander"
            },
            {
                size: 20,
                speed: 0.082,
                hp: 1,
                color: 'rgba(255,100,0',
                behavior: "wander"
            },
            {
                size: 52,
                speed: 0.022,
                hp: 3,
                color: 'rgba(255,0,120',
                behavior: "chase"
            },
            {
                size: 28,
                speed: 0.102,
                hp: 2,
                color: 'rgba(255,255,0',
                behavior: "wanderChase",
                cooldown: 2900
            },
            {
                size: 22,
                speed: 0.064,
                hp: 1,
                color: 'rgba(0,255,255',
                behavior: "chase"
            },
            {
                size: 42,
                speed: 0.032,
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
            if (frame > Math.random() * 100) {
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
                    if (this.enemy[i].hp) {
                        this.behaviors[this.enemy[i].behavior](i);
                        if (
                            this.enemy[i].x < player.x + (this.enemy[i].size >> 1) && 
                            this.enemy[i].x > player.x - (this.enemy[i].size >> 1) && 
                            this.enemy[i].y < player.y + (this.enemy[i].size >> 1) && 
                            this.enemy[i].y > player.y - (this.enemy[i].size >> 1)
                        ) {
                            clearInterval(to);
                            gameOn = false;
                        }
                    }
                }
            }

        },
        render: function() {
            var shadowColor = 'rgba(0,0,0,';
            var opacity = 1;
            var sparks, sparkAngle, sparkStart, sparkEnd;
            var cooldown, size, newColor;
            if(shadowEnabled) ctx.shadowBlur = 5;
            if(shadowEnabled) ctx.shadowOffsetX = 3;
            if(shadowEnabled) ctx.shadowOffsetY = 3;
            for (var i in this.enemy) {
                if (this.enemy[i] !== undefined) {
                    size = this.enemy[i].size;
                    if(this.enemy[i].hp) {
                        if(shadowEnabled) ctx.shadowColor = shadowColor + '1)';
                        newColor = this.enemy[i].color + ",1)";
                        if(ctx.fillStyle !== newColor) ctx.fillStyle = this.enemy[i].color + ",1)";
                        ctx.fillRect(~~this.enemy[i].x - (size >> 1), ~~this.enemy[i].y - (size >> 1), size, size);
                    } else {
                        this.enemy[i].cooldown -= (minusClock * 0.1);
                        cooldown = this.enemy[i].cooldown;
                        if (!cooldown) {
                            this.enemy.splice(i, 1);
                        }
                        else {
                            if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,0)';
                            if(cooldown > 84) {
                                sparks = 3;
                                ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                sparkStart = Math.random() * (110 - cooldown);
                                sparkEnd = Math.random() * (140 - cooldown);
                                while(--sparks) {
                                    sparkAngle = ~~((Math.random() * 628) - 314);
                                    ctx.moveTo(~~(this.enemy[i].death.x + fS[sparkAngle] * sparkStart), ~~(this.enemy[i].death.y + fC[sparkAngle] * sparkStart));
                                    ctx.lineTo(~~(this.enemy[i].death.x + fS[sparkAngle] * sparkEnd), ~~(this.enemy[i].death.y + fC[sparkAngle] * sparkEnd));
                                }
                                ctx.stroke();
                                ctx.closePath();
                            }
                            cacheIndex = ~~ (this.enemy[i].angle * 100);
                            this.enemy[i].x += fS[cacheIndex] * (cooldown * 0.01);
                            this.enemy[i].y += fC[cacheIndex] * (cooldown * 0.01);
                            opacity = (cooldown / 100).toFixed(2);
                            ctx.fillStyle = this.enemy[i].color + "," + opacity + ")";
                            size += ~~ (size * ((100 - cooldown) / 100));
                            ctx.fillRect(~~this.enemy[i].x - (size >> 1), ~~this.enemy[i].y - (size >> 1), size, size);
                        }
                    }
                }
            }
        }
    };
}



function fail() {
    preResetGame();
}

$(document).ready(function () {

    cwidth = 900;
    cheight = 660;
  //  resizeEverything();
 
    canvas = document.getElementById('gamecanvas');
    ctx = canvas.getContext("2d");
    bgcanvas = document.getElementById('bgcanvas');
    bgctx = bgcanvas.getContext("2d");

    canvas.setAttribute('width', cwidth);
    canvas.setAttribute('height', cheight);
    bgcanvas.setAttribute('width', cwidth);
    bgcanvas.setAttribute('height', cheight);

    document.getElementById('bgimg').onload = function() {
        var $this = $(this);
        field.bgimg = {
            img: document.getElementById('bgimg'),
            width: this.width,
            height: this.height
        };
        bgctx.drawImage(field.bgimg.img, 0, 0, field.bgimg.width, field.bgimg.height, 0, 0, cwidth, cheight);
    };
    if(document.getElementById('bgimg').complete) {
        if(document.createEvent) {
            document.getElementById('bgimg').dispatchEvent({ 'load', ''});
        } else {
            document.getElementById('bgimg').fireEvent("onload", { 'load', ''});
        }
    };

    field = {
        width: cwidth,
        height: cheight,
        offset: $("#gamecanvas").offset(),
        image: 'gravel.png',
        render: function() {
            if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,0)';
            canvas.width = canvas.width;
        }
    };

    crosshair = {
        x: 0,
        y: 0,
        render: function() {
            if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,0)';
            ctx.strokeStyle = "#0ff";
            ctx.strokeRect(crosshair.x - 4, crosshair.y - 4, 8, 8);
        }
    };

    if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cwidth, cheight);

    $(document).mousemove(function (event) {
        crosshair.x = (event.pageX - field.offset.left) / canvasScale;
        crosshair.y = (event.pageY - field.offset.top) / canvasScale;
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
                gameOn = true;
                resetGame();
                requestAnimationFrame(doFrame);
            } else {
                if(paused) {
                    gameClock = Date.now();
                    paused = false;
                    requestAnimationFrame(doFrame);
                } else {
                    drawText({ text: "PAUSED", size: 60, color: "#538" });
                    drawText({ text: "Press space to unpause.", y: (cheight >> 1) + 100  });
                    paused = true;
                    fpsCount = 0;
                    fpsTimer = 0;
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
        var curFPS = ~~(fpsCount / (fpsTimer / 1000));
        drawText({
            color: "#f0f",
            text: "FPS: " + curFPS,
            x: 80,
            y: 55
        });
        if(shadowEnabled && curFPS < 50 && fpsTimer > 10000) {
            ctx.shadowColor = 'rgba(0,0,0,0)';
            shadowEnabled = false;
        }
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
        if(!gameOn || paused) return false;
        var newGameClock = Date.now();
        minusClock = newGameClock - gameClock;
        frame += (minusClock * 0.00002);
        fpsCount++;
        fpsTimer += minusClock;
        gameClock = newGameClock;
        gameLogic();
        renderFrame();
        requestAnimationFrame(doFrame);
    }
    preResetGame();
    resetGame();
});

})();