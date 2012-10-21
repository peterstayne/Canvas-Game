;(function() {

var canvas, ctx, player = {},
    field = {},
    canvasScale = 1,
    enemies = {},
    frame = 0.7,
    score = 0,
    to, gameOn = false, paused = false,
    pi = Math.PI,
    piHalf = Math.PI / 2,
    piQuarter = Math.PI / 4,
    piDouble = Math.PI * 2,
    cwidth, cheight,
    fC, fS,
    fakeLimit = (piDouble * 200) >> 0,
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

function findOffset(obj) {
    return {
        left: (window.innerWidth / 2) - (obj.width / 2),
        top: obj.offsetTop
    };
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
       "text": "Controls: Arrow keys or W, A, S, D to move; Mouse to aim and fire",
       "y": pressSpaceY + 18
    });
    gameClock = Date.now();
}

function resetGame() {
    gameClock = Date.now();
    score = 0;
    frame = 1.3;
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
            var cacheindex, thisbullet, thisenemy, size, j;
            for (var i in this.bullets) {
                thisbullet = this.bullets[i];
                cacheIndex = ~~ (thisbullet.angle * 100);
                thisbullet.x += fS[cacheIndex] * (0.7 * minusClock);
                thisbullet.y += fC[cacheIndex] * (0.7 * minusClock);
                for (j in enemies.enemy) {
                    thisenemy = enemies.enemy[j];
                    size = thisenemy.size >> 1;
                    if (thisbullet !== undefined && thisbullet.x < thisenemy.x + thisenemy.size && thisbullet.x > thisenemy.x - thisenemy.size && thisbullet.y < thisenemy.y + thisenemy.size && thisbullet.y > thisenemy.y - thisenemy.size && thisenemy.hp > 0) {
                        thisenemy.hp--;
                        if (thisenemy.hp <= 0) {
                            thisenemy.angle = thisbullet.angle;
                            thisenemy.cooldown = 100;
                            score++;
                            thisenemy.death = {
                                x: thisbullet.x,
                                y: thisbullet.y
                            };
                        }
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
                if (thisbullet !== undefined) {
                    if (thisbullet.x < 0 || thisbullet.x > field.width || thisbullet.y < 0 || thisbullet.y > field.height) {
                        this.bullets.splice(i, 1);
                    }
                }
            }
        },
        render: function() {
            var cacheIndex;
            if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,1)';
            if(shadowEnabled) ctx.shadowBlur = 15;
            if(shadowEnabled) ctx.shadowOffsetX = 0;
            if(shadowEnabled) ctx.shadowOffsetY = 0;
            ctx.fillStyle = "#0f0";
            ctx.fillRect(player.x - 4, player.y - 4, 8, 8);

            if(shadowEnabled) ctx.shadowColor = 'rgba(255,255,0,1)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            for (var i in this.bullets) {
                cacheIndex = ~~ (Math.atan2(player.x - ~~this.bullets[i].x, player.y - ~~this.bullets[i].y) * 100);
                ctx.moveTo(~~this.bullets[i].x, ~~this.bullets[i].y);
                ctx.lineTo(~~this.bullets[i].x + (fS[cacheIndex] * 18), ~~this.bullets[i].y + (fC[cacheIndex] * 18));
            }
            ctx.stroke();
            ctx.closePath();
        }
    };
    enemies = {
        enemy: [],
        behaviors: {
            'wanderChase': function(i) {
                var thisenemy = enemies.enemy[i];
                var angleToPlayer = Math.atan2(player.x - thisenemy.x, player.y - thisenemy.y);
                if (thisenemy.cooldown < 0) {
                    thisenemy.angle = angleToPlayer;
                    thisenemy.cooldown = ~~ (Math.random() * 900) + 300;
                }
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x += fS[cacheIndex] * (thisenemy.speed * minusClock);
                thisenemy.y += fC[cacheIndex] * (thisenemy.speed * minusClock);
                thisenemy.cooldown -= minusClock;
            },
            'chase': function(i) {
                var thisenemy = enemies.enemy[i];
                thisenemy.angle = Math.atan2(player.x - thisenemy.x, player.y - thisenemy.y);
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x += fS[cacheIndex] * (thisenemy.speed * minusClock);
                thisenemy.y += fC[cacheIndex] * (thisenemy.speed * minusClock);
            },
            'divebomb': function(i) {
                var cacheIndex = ~~ (enemies.enemy[i].angle * 100);
                var thisenemy = enemies.enemy[i];
                thisenemy.x += fS[cacheIndex] * (thisenemy.speed * minusClock);
                thisenemy.y += fC[cacheIndex] * (thisenemy.speed * minusClock);
                if(thisenemy.x < 0 || thisenemy.x > field.width || thisenemy.y < 0 || thisenemy.y > field.height) {
                    thisenemy.hp = 0;
                    thisenemy.cooldown = 0;
                }
            },
            'wander': function(i) {
                // PI, -PI = up
                // -half PI = left
                // +half PI = right
                // 0 = down
                var thisenemy = enemies.enemy[i];

                if(thisenemy.angle > pi) thisenemy.angle -= piDouble;
                if(thisenemy.angle < -pi) thisenemy.angle += piDouble;
                
                var oldangle = thisenemy.angle;
                if (thisenemy.x < 0) {
                    if(thisenemy.angle < 0) thisenemy.angle = -thisenemy.angle;
                } else if (thisenemy.x > field.width) {
                    if(thisenemy.angle > 0) thisenemy.angle = -thisenemy.angle;
                }
                if (thisenemy.y < 0) {
                    if(thisenemy.angle < -piHalf) thisenemy.angle = -piHalf + (-piHalf - thisenemy.angle);
                    if(thisenemy.angle > piHalf) thisenemy.angle = piHalf + (piHalf - thisenemy.angle);
                } else if (thisenemy.y > field.height) {
                    if(thisenemy.angle < 0 && thisenemy.angle > -piHalf) thisenemy.angle = -piHalf + (-piHalf - thisenemy.angle);
                    if(thisenemy.angle > 0 && thisenemy.angle < piHalf) thisenemy.angle = piHalf + (piHalf - thisenemy.angle);
                }
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x += fS[cacheIndex] * (thisenemy.speed * minusClock);
                thisenemy.y += fC[cacheIndex] * (thisenemy.speed * minusClock);
            }            
        },
        types: [
            {
                size: 46,
                speed: 0.042 ,
                hp: 1,
                color: 'rgba(255,0,0',
                behavior: "wander"
            },
            {
                size: 22,
                speed: 0.092,
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
                speed: 0.099,
                hp: 2,
                color: 'rgba(255,255,0',
                behavior: "wanderChase",
                cooldown: 3900
            },
            {
                size: 20,
                speed: 0.064,
                hp: 1,
                color: 'rgba(0,255,255',
                behavior: "chase"
            },
            {
                size: 30,
                speed: 0.17,
                hp: 1,
                color: 'rgba(255,140,100',
                behavior: 'divebomb'
            },
            {
                size: 42,
                speed: 0.032,
                hp: 5,
                color: 'rgba(255,155,255',
                behavior: "wander"
            }
        ],
        spawnEnemy: function(newEnemy) {
            this.enemy.push(newEnemy);
        },
        logic: function() {
            if (frame > Math.random() * 100) {
                var newEnemy;
                var whichwall = ~~(Math.random() * 4);
                var type = ~~(Math.random() * ~~frame);
                if (type > this.types.length - 1) {
                    type = this.types.length - 1;
                }
                var thisType = this.types[type];
                // direct assignment instead of obj copy
                newEnemy = {
                    size: thisType.size,
                    speed: thisType.speed,
                    hp: thisType.hp,
                    color: thisType.color,
                    behavior: thisType.behavior
                };

                switch (whichwall) {
                case 0:
                    // top wall
                    newEnemy.x = ~~(Math.random() * field.width);
                    newEnemy.y = 0;
                    break;
                case 1:
                    // bottom wall
                    newEnemy.x = ~~(Math.random() * field.width);
                    newEnemy.y = field.height;
                    break;
                case 2:
                    // left wall
                    newEnemy.x = 0;
                    newEnemy.y = ~~(Math.random() * field.height);
                    break;
                case 3:
                    // right wall
                    newEnemy.x = field.width;
                    newEnemy.y = ~~(Math.random() * field.height);
                    break;
                }
                newEnemy.angle = Math.atan2(player.x - newEnemy.x, player.y - newEnemy.y)
                this.spawnEnemy(newEnemy);
            }
            var thisenemy;
            for (var i in enemies.enemy) {
                thisenemy = this.enemy[i];
                if (thisenemy !== undefined) {
                    if (thisenemy.hp) {
                        this.behaviors[thisenemy.behavior](i);
                        if (
                            thisenemy.x < player.x + (thisenemy.size >> 1) && 
                            thisenemy.x > player.x - (thisenemy.size >> 1) && 
                            thisenemy.y < player.y + (thisenemy.size >> 1) && 
                            thisenemy.y > player.y - (thisenemy.size >> 1)
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
                        if (cooldown <= 0) {
                            this.enemy.splice(i, 1);
                        }
                        else {
                            if(shadowEnabled) ctx.shadowColor = 'rgba(0,0,0,0)';
                            if(cooldown > 84) {
                                sparks = 3;
                                ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                                ctx.lineWidth = 4;
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
                            this.enemy[i].x += fS[cacheIndex] * (cooldown * 0.03);
                            this.enemy[i].y += fC[cacheIndex] * (cooldown * 0.03);
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

    var bgload = function() {
        var theimg = document.getElementById('bgimg');
        field.bgimg = {
            img: theimg,
            width: theimg.width,
            height: theimg.height
        };
        bgctx.drawImage(field.bgimg.img, 0, 0, field.bgimg.width, field.bgimg.height, 0, 0, cwidth, cheight);
    };

    document.getElementById('bgimg').onload = bgload;
    if(document.getElementById('bgimg').complete) bgload();

    field = {
        width: cwidth,
        height: cheight,
        offset: findOffset(canvas),
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

    document.onmousemove = function (event) {
        crosshair.x = (event.pageX - field.offset.left) / canvasScale;
        crosshair.y = (event.pageY - field.offset.top) / canvasScale;
    };
    document.onmousedown = function (event) {
        player.fireShot();
        player.firing = true;
        player.cooldown = 20;
        event.stopPropagation();
        return false;
    };
    document.onmouseup = function () {
        player.firing = false;
    };
    window.onkeydown = function (event) {
        console.log(event.keyCode);
        switch (event.keyCode) {
        case 38:
        case 87:
            player.moveUp = true;
            break;
        case 37:
        case 65:
            player.moveLeft = true;
            break;
        case 39:
        case 68:
            player.moveRight = true;
            break;
        case 40:
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
    };
    window.onkeyup = function (event) {
        switch (event.keyCode) {
        case 38:
        case 87:
            player.moveUp = false;
            break;
        case 37:
        case 65:
            player.moveLeft = false;
            break;
        case 39:
        case 68:
            player.moveRight = false;
            break;
        case 40:
        case 83:
            player.moveDown = false;
            break;
        }
    };

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

})();