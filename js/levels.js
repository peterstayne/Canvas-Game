g.levels = {
    helpers: {
        getEnemyTemplate: function(type) {
            var thisType = g.game.enemies.types[type];
            return {
                size: thisType.size,
                speed: thisType.speed,
                hp: thisType.hp,
                color: thisType.color,
                behavior: thisType.behavior,
                cooldown: thisType.cooldown,
                status: "alive",
                x: 0,
                y: 0,
                followers: 0,
                follow: '',
                angleAdjust: null,
                adjustCooldown: null
            };
        },
        getRandomWallCoordinate: function() {
            var whichwall = ~~(Math.random() * 4);
            var returnCoordinate = { x: null, y: null };
            switch (whichwall) {
            case 0:
                // top wall
                returnCoordinate.x = ~~(Math.random() * g.game.field.width);
                returnCoordinate.y = 0;
                break;
            case 1:
                // bottom wall
                returnCoordinate.x = ~~(Math.random() * g.game.field.width);
                returnCoordinate.y = g.game.field.height;
                break;
            case 2:
                // left wall
                returnCoordinate.x = 0;
                returnCoordinate.y = ~~(Math.random() * g.game.field.height);
                break;
            case 3:
                // right wall
                returnCoordinate.x = g.game.field.width;
                returnCoordinate.y = ~~(Math.random() * g.game.field.height);
                break;
            }
            return returnCoordinate;
        }
    },
    "ringers": function() {
        if (g.game.frame > Math.random() * 100) {
            var newEnemy = g.levels.helpers.getEnemyTemplate("ringer-weak");
            var newCoordinate = g.levels.helpers.getRandomWallCoordinate();
            newEnemy.x = newEnemy.oldX = newCoordinate.x;
            newEnemy.y = newEnemy.oldY = newCoordinate.y;
            newEnemy.angle = Math.atan2(g.game.player.x - newEnemy.x, g.game.player.y - newEnemy.y);
            newEnemy.followers = ~~(Math.random() * 4) + 8;
            newEnemy.angleAdjust = (Math.random() * 0.02) - 0.01;
            newEnemy.adjustCooldown = 6000;
            g.game.enemies.spawnEnemy(newEnemy);
        }
    },
    "survival": function() {
        var commons = ["dumbo", "brat", "dumbo-fat", "little-red", "cyanide", "arrow", "dumbo-obese"];
        var rares = ["ringer-weak", "snake"];
        var type = '';
        var randseed = Math.random() * 100;
        if (g.game.frame > randseed) {
            if ((g.game.frame / 40) > randseed) {
                type = rares[~~(Math.random() * Math.min(~~g.game.frame, rares.length - 1))];
            } else {
                type = commons[~~(Math.random() * Math.min(~~g.game.frame, commons.length - 1))];
            }
            // direct assignment instead of obj copy
            var newEnemy = g.levels.helpers.getEnemyTemplate(type);
            var newCoordinate = g.levels.helpers.getRandomWallCoordinate();
            newEnemy.x = newEnemy.oldX = newCoordinate.x;
            newEnemy.y = newEnemy.oldY = newCoordinate.y;
            newEnemy.angle = Math.atan2(g.game.player.x - newEnemy.x, g.game.player.y - newEnemy.y);
            switch (newEnemy.behavior) {
                case "ringerHub":
                    newEnemy.followers = ~~(Math.random() * 4) + 8;
                    newEnemy.angleAdjust = (Math.random() * 0.02) - 0.01;
                    newEnemy.adjustCooldown = 6000;
                    g.game.enemies.spawnEnemy(newEnemy);
                    break;
                case "centipede":
                    newEnemy.follow = '';
                    newEnemy.followers = ~~(Math.random() * 10) + 8;
                    newEnemy.angleAdjust = (Math.random() * 0.02) - 0.01;
                    newEnemy.adjustCooldown = 6000;
                    g.game.enemies.spawnEnemy(newEnemy);
                    break;
                default:
                    g.game.enemies.spawnEnemy(newEnemy);
            }
        }
    }
};