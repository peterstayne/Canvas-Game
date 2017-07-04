g.game.init.push(function(){
    g.game.enemies = {
        enemyCount: 0,
        enemy: {},
        behaviors: {
            'wanderChase': function(i) {
                var thisenemy = g.game.enemies.enemy[i];
                var angleToPlayer = Math.atan2(g.game.player.x - thisenemy.x, g.game.player.y - thisenemy.y);
                if (thisenemy.cooldown < 0) {
                    thisenemy.angle = angleToPlayer;
                    thisenemy.cooldown = ~~ (Math.random() * 3900) + 2300;
                }
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x += g.helpers.fS[cacheIndex] * (thisenemy.speed * g.game.minusClock);
                thisenemy.y += g.helpers.fC[cacheIndex] * (thisenemy.speed * g.game.minusClock);
                thisenemy.cooldown -= g.game.minusClock;
            },
            'chase': function(i) {
                var thisenemy = g.game.enemies.enemy[i];
                thisenemy.angle = Math.atan2(g.game.player.x - thisenemy.x, g.game.player.y - thisenemy.y);
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x += g.helpers.fS[cacheIndex] * (thisenemy.speed * g.game.minusClock);
                thisenemy.y += g.helpers.fC[cacheIndex] * (thisenemy.speed * g.game.minusClock);
            },
            'divebomb': function(i) {
                var cacheIndex = ~~ (g.game.enemies.enemy[i].angle * 100);
                var thisenemy = g.game.enemies.enemy[i];
                thisenemy.x += g.helpers.fS[cacheIndex] * (thisenemy.speed * g.game.minusClock);
                thisenemy.y += g.helpers.fC[cacheIndex] * (thisenemy.speed * g.game.minusClock);
                if(thisenemy.x < 0 || thisenemy.x > g.game.field.width || thisenemy.y < 0 || thisenemy.y > g.game.field.height) {
                    thisenemy.hp = 0;
                    thisenemy.cooldown = 0;
                }
            },
            'wanderCurve': function(i) {
                var thisenemy = g.game.enemies.enemy[i];
                if(thisenemy.adjustCooldown > 0) {
                    thisenemy.adjustCooldown -= g.game.minusClock;
                    if(thisenemy.adjustCooldown <= 0) {
                        thisenemy.adjustCooldown = 6000;
                        thisenemy.angleAdjust = (Math.random() * 0.02) - 0.01;
                    }
                }
                thisenemy.angle += thisenemy.angleAdjust;
                g.game.enemies.behaviors['wander'](i);
            },
            'ringerHub': function(i) {
                var thisenemy = g.game.enemies.enemy[i];
                if(thisenemy.followers) {
                    var sepAngle = g.helpers.piDouble / (thisenemy.followers - 1);
                    var radii = Math.random() * 150 + 50;
                    var thisAdjust = ([-1,1][Math.round(Math.random())]) * ((Math.random() * 0.05) + 0.02);
                    while(--thisenemy.followers) {
                        g.game.enemies.spawnEnemy({
                            x: thisenemy.x,
                            y: thisenemy.y,
                            size: 32,
                            angle: thisenemy.followers * sepAngle,
                            follow: i,
                            cooldown: 4500,
                            radii: radii,
                            behavior: 'ringer',
                            color: 'rgba(112,255,152',
                            hp: 1,
                            angleAdjust: thisAdjust,
                            status: "alive",
                            speed: thisenemy.speed,
                            followers: thisenemy.followers - 1
                        });
                    }
                    thisenemy.followers = 0;
                }
                g.game.enemies.behaviors['wanderCurve'](i);
            },
            'ringer': function(i) {
                var thisenemy = g.game.enemies.enemy[i];
                if(thisenemy.follow === '' || g.game.enemies.enemy[thisenemy.follow].status === "dead") {
                    thisenemy.behavior = "wander";
                    g.game.enemies.behaviors['wander'](i);
                    return true;
                }
                var thisradii = thisenemy.radii;
                var followEnemy = g.game.enemies.enemy[thisenemy.follow];
                if(thisenemy.cooldown > 0) {
                    thisenemy.cooldown -= g.game.minusClock;
                    thisradii = ((4500 - thisenemy.cooldown) / 4500) * thisenemy.radii;
                }
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x = g.helpers.fC[cacheIndex] * thisradii + followEnemy.x;
                thisenemy.y = g.helpers.fS[cacheIndex] * thisradii + followEnemy.y;
                thisenemy.angle += thisenemy.angleAdjust;
                if(thisenemy.angle > g.helpers.pi) {
                    thisenemy.angle -= g.helpers.piDouble;
                }
                if(thisenemy.angle < -g.helpers.pi) {
                    thisenemy.angle += g.helpers.piDouble;
                }
            },
            'snake': function(i) {
                var thisenemy = g.game.enemies.enemy[i];
                if(thisenemy.cooldown > 0) {
                    thisenemy.cooldown -= g.game.minusClock;
                    if(thisenemy.cooldown <= 0) {
                        if(thisenemy.followers) {
                            g.game.enemies.spawnEnemy({
                                x: thisenemy.oldX,
                                y: thisenemy.oldY,
                                oldX: thisenemy.oldX,
                                oldY: thisenemy.oldY,
                                size: thisenemy.size,
                                angle: thisenemy.angle,
                                adjustCooldown: 6000,
                                angleAdjust: (Math.random() * 0.02) - 0.01,
                                follow: i,
                                cooldown: 200,
                                behavior: 'snake',
                                color: thisenemy.color,
                                hp: 2,
                                status: "alive",
                                speed: thisenemy.speed,
                                followers: thisenemy.followers - 1
                            });
                            thisenemy.followers = 0;
                        }
                    }
                }
                if(thisenemy.follow === '' || g.game.enemies.enemy[thisenemy.follow].status === "dead") {
                    if(thisenemy.follow !== '') {
                        thisenemy.follow = '';
                    }
                    thisenemy.color = 'rgba(220,0,220';
                    g.game.enemies.behaviors['wanderCurve'](i);
                    return;
                }
                thisenemy.color = 'rgba(140,0,140';
                var followEnemy = g.game.enemies.enemy[thisenemy.follow];
                if(g.helpers.findDistance(thisenemy.x, thisenemy.y, followEnemy.x, followEnemy.y) > 25) {
                    thisenemy.speed = 0.112;
                } else {
                    thisenemy.speed = 0.050;
                }
                thisenemy.angle = Math.atan2(followEnemy.x - thisenemy.x, followEnemy.y - thisenemy.y);
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x += g.helpers.fS[cacheIndex] * (thisenemy.speed * g.game.minusClock);
                thisenemy.y += g.helpers.fC[cacheIndex] * (thisenemy.speed * g.game.minusClock);
            },
            'wander': function(i) {
                // PI, -PI = up
                // -half PI = left
                // +half PI = right
                // 0 = down
                var thisenemy = g.game.enemies.enemy[i];

                if(thisenemy.angle > g.helpers.pi) thisenemy.angle -= g.helpers.piDouble;
                if(thisenemy.angle < -g.helpers.pi) thisenemy.angle += g.helpers.piDouble;
                
                var oldangle = thisenemy.angle;
                if (thisenemy.x < 0) {
                    if(thisenemy.angle < 0) thisenemy.angle = -thisenemy.angle;
                } else if (thisenemy.x > g.game.field.width) {
                    if(thisenemy.angle > 0) thisenemy.angle = -thisenemy.angle;
                }
                if (thisenemy.y < 0) {
                    if(thisenemy.angle < -g.helpers.piHalf) thisenemy.angle = -g.helpers.piHalf + (-g.helpers.piHalf - thisenemy.angle);
                    if(thisenemy.angle > g.helpers.piHalf) thisenemy.angle = g.helpers.piHalf + (g.helpers.piHalf - thisenemy.angle);
                } else if (thisenemy.y > g.game.field.height) {
                    if(thisenemy.angle < 0 && thisenemy.angle > -g.helpers.piHalf) thisenemy.angle = -g.helpers.piHalf + (-g.helpers.piHalf - thisenemy.angle);
                    if(thisenemy.angle > 0 && thisenemy.angle < g.helpers.piHalf) thisenemy.angle = g.helpers.piHalf + (g.helpers.piHalf - thisenemy.angle);
                }
                var cacheIndex = ~~ (thisenemy.angle * 100);
                thisenemy.x += g.helpers.fS[cacheIndex] * (thisenemy.speed * g.game.minusClock);
                thisenemy.y += g.helpers.fC[cacheIndex] * (thisenemy.speed * g.game.minusClock);
            }            
        },
        types: {
            "dumbo":{
                size: 46,
                speed: 0.062 ,
                hp: 1,
                color: 'rgba(64,64,255',
                behavior: "wander",
                cooldown: 0
            },
            "brat":{
                size: 22,
                speed: 0.132,
                hp: 1,
                color: 'rgba(255,100,0',
                behavior: "wander",
                cooldown: 0
            },
            "dumbo-fat":{
                size: 52,
                speed: 0.022,
                hp: 3,
                color: 'rgba(0,0,180',
                behavior: "chase",
                cooldown: 0
            },
            "ringer-weak":{
                size: 22,
                speed: 0.072 ,
                hp: 4,
                color: 'rgba(64,124,84',
                behavior: "ringerHub",
                cooldown: 6000
            },
            "snake":{
                size: 31,
                speed: 0.132,
                hp: 1,
                color: 'rgba(220,0,220',
                behavior: "snake",
                cooldown: 200
            },
            "little-red":{
                size: 28,
                speed: 0.09,
                hp: 2,
                color: 'rgba(255,0,0',
                behavior: "wanderChase",
                cooldown: 3900
            },
            "cyanide":{
                size: 20,
                speed: 0.064,
                hp: 1,
                color: 'rgba(0,255,255',
                behavior: "chase",
                cooldown: 0
            },
            "arrow":{
                size: 30,
                speed: 0.17,
                hp: 1,
                color: 'rgba(255,255,0',
                behavior: 'divebomb',
                cooldown: 0
            },
            "dumbo-obese":{
                size: 42,
                speed: 0.032,
                hp: 5,
                color: 'rgba(0,0,80',
                behavior: "wander",
                cooldown: 0
            }
        },
        spawnEnemy: function(newEnemy) {
            g.game.enemies.enemyCount ++;
            var newIndex = 'e' + g.game.enemies.enemyCount;
            g.game.enemies.enemy[newIndex] = newEnemy;
            return newIndex;
        },
        spawnNamedEnemy: function(enemyName) {
            g.helpers.objectCopy(g.game.enemies.types[enemyName]);
        },
        logic: function() {
            var thisenemy;
            for (var i = 0, keys = Object.keys(g.game.enemies.enemy), l = keys.length; i < l; ++i) {
                thisenemy = g.game.enemies.enemy[keys[i]];
                if (thisenemy !== undefined) {
                    if (thisenemy.status !== "dead") {
                        g.game.enemies.behaviors[thisenemy.behavior](keys[i]);
                        if (
                            thisenemy.x < g.game.player.x + (thisenemy.size >> 1) && 
                            thisenemy.x > g.game.player.x - (thisenemy.size >> 1) && 
                            thisenemy.y < g.game.player.y + (thisenemy.size >> 1) && 
                            thisenemy.y > g.game.player.y - (thisenemy.size >> 1)
                        ) {
                            g.game.gameOn = false;
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
            if(g.shadowEnabled) {
                g.ctx.shadowBlur = 5;
                g.ctx.shadowOffsetX = 3;
                g.ctx.shadowOffsetY = 3;
            }
            var thisenemy;
            for (var i = 0, keys = Object.keys(g.game.enemies.enemy), l = keys.length; i < l; ++i) {
                thisenemy = g.game.enemies.enemy[keys[i]];
                size = thisenemy.size;
                if(thisenemy.status !== "dead") {
                    if(g.shadowEnabled) g.ctx.shadowColor = shadowColor + '1)';
                    if(thisenemy.status !== "wounded") {
                        newColor = thisenemy.color + ",1)";
                    } else {
                        thisenemy.status = "alive";
                        newColor = "rgba(255,255,255,1)";
                    }
                    if(g.ctx.fillStyle !== newColor) {
                        g.ctx.fillStyle = newColor;
                    }
                    g.ctx.fillRect(~~thisenemy.x - (size >> 1), ~~thisenemy.y - (size >> 1), size, size);
                } else {
                    var thisEnemyColor = thisenemy.color;
                    if(thisenemy.cooldown === 100) {
                        thisEnemyColor = "rgba(255,255,255";
                    }
                    thisenemy.cooldown -= (g.game.minusClock * 0.1);
                    cooldown = thisenemy.cooldown;
                    if (cooldown <= 0) {
                        delete g.game.enemies.enemy[keys[i]];
                    }
                    else {
                        if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';
                        if(cooldown > 90) {
                            sparks = 3;
                            g.ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
                            g.ctx.lineWidth = 4;
                            g.ctx.beginPath();
                            sparkStart = Math.random() * (110 - cooldown);
                            sparkEnd = Math.random() * (140 - cooldown);
                            while(--sparks) {
                                sparkAngle = ~~((Math.random() * 628) - 314);
                                g.ctx.moveTo(~~(thisenemy.death.x + g.helpers.fS[sparkAngle] * sparkStart), ~~(thisenemy.death.y + g.helpers.fC[sparkAngle] * sparkStart));
                                g.ctx.lineTo(~~(thisenemy.death.x + g.helpers.fS[sparkAngle] * sparkEnd), ~~(thisenemy.death.y + g.helpers.fC[sparkAngle] * sparkEnd));
                            }
                            g.ctx.stroke();
                            g.ctx.closePath();
                        }
                        cacheIndex = ~~ (thisenemy.angle * 100);
                        thisenemy.x += g.helpers.fS[cacheIndex] * (cooldown * 0.03);
                        thisenemy.y += g.helpers.fC[cacheIndex] * (cooldown * 0.03);
                        opacity = (cooldown / 100).toFixed(2);
                        g.ctx.fillStyle = thisEnemyColor + "," + opacity + ")";
                        size += ~~ (size * ((100 - cooldown) / 100));
                        g.ctx.fillRect(~~thisenemy.x - (size >> 1), ~~thisenemy.y - (size >> 1), size, size);
                    }
                }
            }
        }
    };
});