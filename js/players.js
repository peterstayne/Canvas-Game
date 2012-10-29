g.game.init.push(function() {
    g.game.player = {
        x: ~~ (g.cwidth / 2),
        y: ~~ (g.cheight / 2),
        hp: 100,
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        firing: false,
        cooldown: 25,
        bullets: [],
        fireShot: function () {
            g.game.player.bullets.push({
                x: g.game.player.x,
                y: g.game.player.y,
                angle: Math.atan2(g.ui.crosshair.x - g.game.player.x, g.ui.crosshair.y - g.game.player.y)
            });
        },
        logic: function() {
            if (g.game.player.moveLeft && g.game.player.x > 0 && !g.game.player.moveRight) {
                g.game.player.x -= (0.12 * g.game.minusClock);
            }
            if (g.game.player.moveRight && g.game.player.x < g.game.field.width && !g.game.player.moveLeft) {
                g.game.player.x += (0.12 * g.game.minusClock);
            }
            if (g.game.player.moveUp && g.game.player.y > 0 && !g.game.player.moveDown) {
                g.game.player.y -= (0.12 * g.game.minusClock);
            }
            if (g.game.player.moveDown && g.game.player.y < g.game.field.height && !g.game.player.moveUp) {
                g.game.player.y += (0.12 * g.game.minusClock);
            }
            if (g.game.player.firing && (g.game.player.cooldown = g.game.player.cooldown - (g.game.minusClock * 0.2)) <= 0) {
                g.game.player.fireShot();
                g.game.player.cooldown = 25;
            }
            var cacheindex, thisbullet, thisenemy, size, j, removed;
            for (var i = 0, l = g.game.player.bullets.length; i < l; ++i) {
                removed = false;
                thisbullet = g.game.player.bullets[i];
                cacheIndex = ~~ (thisbullet.angle * 100);
                thisbullet.x += g.helpers.fS[cacheIndex] * (0.7 * g.game.minusClock);
                thisbullet.y += g.helpers.fC[cacheIndex] * (0.7 * g.game.minusClock);
                for (var j = 0, keysE = Object.keys(g.game.enemies.enemy), lE = keysE.length; j < lE; ++j) {
                    thisenemy = g.game.enemies.enemy[keysE[j]];
                    size = thisenemy.size >> 1;
                    if (thisbullet !== undefined && thisbullet.x < thisenemy.x + thisenemy.size && thisbullet.x > thisenemy.x - thisenemy.size && thisbullet.y < thisenemy.y + thisenemy.size && thisbullet.y > thisenemy.y - thisenemy.size && thisenemy.status !== "dead") {
                        thisenemy.hp--;
                        if (thisenemy.hp > 0) {
                            thisenemy.status = "wounded";
                            thisenemy.x += g.helpers.fS[cacheIndex] * 6;
                            thisenemy.y += g.helpers.fC[cacheIndex] * 6;
                        } else {
                            thisenemy.status = "dead";
                            thisenemy.angle = thisbullet.angle;
                            thisenemy.cooldown = 100;
                            g.game.score++;
                            thisenemy.death = {
                                x: thisbullet.x,
                                y: thisbullet.y
                            };
                        }
                        removed = true;
                        break;
                    }
                }
                if (!removed) {
                    if (thisbullet.x < 0 || thisbullet.x > g.game.field.width || thisbullet.y < 0 || thisbullet.y > g.game.field.height) {
                        removed = true;
                    }
                }
                if(removed) {
                    g.game.player.bullets.splice(i, 1);
                    l--; i--;
                }
            }
        },
        render: function() {
            var cacheIndex;
            if(g.shadowEnabled) {
                g.ctx.shadowColor = 'rgba(0,0,0,1)';
                g.ctx.shadowBlur = 15;
                g.ctx.shadowOffsetX = 0;
                g.ctx.shadowOffsetY = 0;
            }
            g.ctx.fillStyle = "#0f0";
            g.ctx.fillRect(g.game.player.x - 4, g.game.player.y - 4, 8, 8);

            if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(255,255,0,1)';
            g.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            g.ctx.lineWidth = 4;
            g.ctx.beginPath();
            var thisbullet;
            for (var i = 0, keys = Object.keys(g.game.player.bullets), l = keys.length; i < l; ++i) {
                thisbullet = g.game.player.bullets[keys[i]];
                cacheIndex = ~~ (Math.atan2(g.game.player.x - ~~thisbullet.x, g.game.player.y - ~~thisbullet.y) * 100);
                g.ctx.moveTo(~~thisbullet.x, ~~thisbullet.y);
                g.ctx.lineTo(~~thisbullet.x + (g.helpers.fS[cacheIndex] * 18), ~~thisbullet.y + (g.helpers.fC[cacheIndex] * 18));
            }
            g.ctx.stroke();
            g.ctx.closePath();
        }
    };
});