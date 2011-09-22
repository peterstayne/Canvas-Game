var canvas, ctx, player = {},
    field = {},
    enemies = [],
    frame = 0.7,
    score = 0,
    enemy_types = [],
    to, gameOn = false, paused = false;
var cpi = Math.PI,
    cpi2 = Math.PI / 2,
    cpi4 = Math.PI / 4,
    cpi3 = cpi + cpi2,
    cpi360 = Math.PI * 2;
var cwidth, cheight;
var fC, fS;
var fakeLimit = (cpi360 * 100) >> 0;

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
    if(typeof params.text === "undefined" || params.text.length == 0) {
        console.log('no text passed');
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
    enemies = [];
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
        bullets: Array(),
        fireShot: function () {
            var ni = this.bullets.length + 1;
            this.bullets[ni] = {
                x: player.x,
                y: player.y,
                angle: Math.atan2(crosshair.x - this.x, crosshair.y - this.y)
            };
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
            if (this.firing && --this.cooldown == 0) {
                this.fireShot();
                this.cooldown = 25;
            }
            for (var i in this.bullets) {
                var cacheIndex = ~~ (this.bullets[i].angle * 100);
                this.bullets[i].x += fS[cacheIndex] * 2;
                this.bullets[i].y += fC[cacheIndex] * 2;
                for (var j in enemies.enemy) {
                    size = enemy_types[enemies.enemy[j].type].size >> 1;
                    if (
                        this.bullets[i] !== undefined && 
                        this.bullets[i].x < enemies.enemy[j].x + size && 
                        this.bullets[i].x > enemies.enemy[j].x - size && 
                        this.bullets[i].y < enemies.enemy[j].y + size && 
                        this.bullets[i].y > enemies.enemy[j].y - size && 
                        enemies.enemy[j].hp > 0
                    ) {
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
      enemy: Array(),
      logic: function() {
        if (frame > Math.random() * 200) {
            var ni = this.enemy.length;
            var whichwall = ~~(Math.random() * 4);
            var type = ~~(Math.random() * ~~frame);
            if (type > enemy_types.length - 1) type = enemy_types.length - 1;
            switch (whichwall) {
            case 0:
                // top wall
                this.enemy[ni] = {
                    x: ~~ (Math.random() * field.width),
                    y: 0,
                    type: type,
                    hp: enemy_types[type].hp,
                    angle: 0,
                    cooldown: 0
                };
                if (enemy_types[this.enemy[ni].type].behavior == "bounce" || enemy_types[this.enemy[ni].type].behavior == "wander") {
                    this.enemy[ni].angle = Math.random() * cpi + cpi3;
                }
                break;
            case 1:
                // bottom wall
                this.enemy[ni] = {
                    x: ~~ (Math.random() * field.width),
                    y: field.height,
                    type: type,
                    hp: enemy_types[type].hp,
                    angle: 0,
                    cooldown: 0
                };
                if (enemy_types[this.enemy[ni].type].behavior == "bounce" || enemy_types[this.enemy[ni].type].behavior == "wander") {
                    this.enemy[ni].angle = Math.random() * cpi + cpi2;
                }
                break;
            case 2:
                // left wall
                this.enemy[ni] = {
                    x: 0,
                    y: ~~ (Math.random() * field.height),
                    type: type,
                    hp: enemy_types[type].hp,
                    angle: 0,
                    cooldown: 0
                };
                if (enemy_types[this.enemy[ni].type].behavior == "bounce" || enemy_types[this.enemy[ni].type].behavior == "wander") {
                    this.enemy[ni].angle = Math.random() * cpi;
                }
                break;
            case 3:
                // right wall
                this.enemy[ni] = {
                    x: field.width,
                    y: ~~ (Math.random() * field.height),
                    type: type,
                    hp: enemy_types[type].hp,
                    angle: 0,
                    cooldown: 0
                };
                if (enemy_types[this.enemy[ni].type].behavior == "bounce" || enemy_types[this.enemy[ni].type].behavior == "wander") {
                    this.enemy[ni].angle = Math.random() * cpi + cpi;
                }
                break;
            }
            if (this.enemy[ni].angle < 0) {
                this.enemy[ni].angle += cpi360;
            }
            if (this.enemy[ni].angle > cpi360) {
                this.enemy[ni].angle -= cpi360;
            }
        }
        for (var i in enemies.enemy) {
            if (this.enemy[i] !== undefined) {
                size = enemy_types[this.enemy[i].type].size;
                speed = enemy_types[this.enemy[i].type].speed;
                ebehavior = enemy_types[this.enemy[i].type].behavior;
                oldangle = this.enemy[i].angle;
                if (enemies.enemy[i].hp > 0) {
                    switch (ebehavior) {
                    case "chase":
                        angleToPlayer = Math.atan2(player.x - this.enemy[i].x, player.y - this.enemy[i].y);
                        cacheIndex = ~~ (angleToPlayer * 100);
                        this.enemy[i].x += fC[cacheIndex] * speed;
                        this.enemy[i].y += fC[cacheIndex] * speed;
                        break;
                    case "wander-chase":
                        angleToPlayer = Math.atan2(player.x - this.enemy[i].x, player.y - this.enemy[i].y);
                        if (this.enemy[i].cooldown < 0) {
                            this.enemy[i].angle = angleToPlayer;
                            this.enemy[i].cooldown = ~~ (Math.random() * 1500) + 500;
                        }
                        cacheIndex = ~~ (this.enemy[i].angle * 100);
                        this.enemy[i].x += fS[cacheIndex] * speed;
                        this.enemy[i].y += fC[cacheIndex] * speed;
                        this.enemy[i].cooldown -= 1;
                        break;
                    case "wander":
                        if (this.enemy[i].cooldown < 0) {
                            this.enemy[i].angle = Math.random() * cpi360;
                            this.enemy[i].cooldown = ~~ (Math.random() * 2000) + 1000;
                        }
                        this.enemy[i].cooldown -= 1;
                    case "bounce":
                        if (this.enemy[i].x < 0) {
                            if (this.enemy[i].angle < cpi3 && this.enemy[i].angle > cpi) {
                                this.enemy[i].angle = cpi - (this.enemy[i].angle - cpi);
                            }
                            if (this.enemy[i].angle > cpi3 && this.enemy[i].angle == oldangle) {
                                this.enemy[i].angle = cpi360 - this.enemy[i].angle;
                            }
                        }
                        if (this.enemy[i].x > field.width) {
                            if (this.enemy[i].angle > cpi2 && this.enemy[i].angle < cpi && this.enemy[i].angle == oldangle) {
                                this.enemy[i].angle = cpi + (cpi - this.enemy[i].angle);
                            }
                            if (this.enemy[i].angle < cpi2 && this.enemy[i].angle == oldangle) {
                                this.enemy[i].angle = cpi360 - this.enemy[i].angle;
                            }
                        }
                        if (this.enemy[i].y < 0) {
                            if (this.enemy[i].angle > cpi2 && this.enemy[i].angle < cpi && this.enemy[i].angle == oldangle) {
                                this.enemy[i].angle = cpi2 + (cpi2 - this.enemy[i].angle);
                            }
                            if (this.enemy[i].angle > cpi && this.enemy[i].angle < cpi3 && this.enemy[i].angle == oldangle) {
                                this.enemy[i].angle = cpi3 + (cpi3 - this.enemy[i].angle);
                            }
                        }
                        if (this.enemy[i].y > field.height) {
                            if (this.enemy[i].angle > cpi3 && this.enemy[i].angle == oldangle) {
                                this.enemy[i].angle = cpi3 - (this.enemy[i].angle - cpi3);
                            }
                            if (this.enemy[i].angle < cpi2 && this.enemy[i].angle == oldangle) {
                                this.enemy[i].angle = cpi2 + (cpi2 - this.enemy[i].angle);
                            }
                        }
                        cacheIndex = ~~ (this.enemy[i].angle * 100);
                        enemies.enemy[i].x += fS[cacheIndex] * speed;
                        enemies.enemy[i].y += fC[cacheIndex] * speed;
                    }
                    if (
                        this.enemy[i].x < player.x + (size >> 1) && 
                        this.enemy[i].x > player.x - (size >> 1) && 
                        this.enemy[i].y < player.y + (size >> 1) && 
                        this.enemy[i].y > player.y - (size >> 1) && 
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
            size = enemy_types[this.enemy[i].type].size;
            if (this.enemy[i] !== undefined) {
                if(this.enemy[i].hp > 0) {
                    ctx.fillStyle = enemy_types[this.enemy[i].type].color + ",1)";
                    ctx.fillRect(~~this.enemy[i].x - (size >> 1), ~~this.enemy[i].y - (size >> 1), size, size);
                } else {
                    this.enemy[i].cooldown -= 1;
                    if (this.enemy[i].cooldown < 0) {
                        this.enemy.splice(i, 1);
                    }
                    else {
                        ctx.fillStyle = enemy_types[this.enemy[i].type].color + "," + (this.enemy[i].cooldown / 100).toFixed(2) + ")";
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
    enemy_types[0] = {
        size: 36,
        speed: 0.18,
        hp: 1,
        color: 'rgba(255,0,0',
        behavior: 'wander'
    }
    enemy_types[1] = {
        size: 20,
        speed: 0.42,
        hp: 1,
        color: 'rgba(255,100,0',
        behavior: 'bounce'
    }
    enemy_types[2] = {
        size: 52,
        speed: 0.12,
        hp: 3,
        color: 'rgba(255,0,120',
        behavior: 'chase'
    }
    enemy_types[3] = {
        size: 28,
        speed: 0.42,
        hp: 2,
        color: 'rgba(255,255,0',
        behavior: 'wander-chase'
    }

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
        y: 0
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
        ctx.strokeStyle = "#0ff";
        ctx.strokeRect(crosshair.x - 4, crosshair.y - 4, 8, 8);

        updateScore();

        if(!gameOn) {
            fail();
        }
    }

    function doFrame() {
        frame += 0.00015;
        gameLogic();
        renderFrame();
    }
    preResetGame();
    resetGame();
});