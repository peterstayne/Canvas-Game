g.game = {
    score: 0,
    gameOn: false,
    paused: false,
    frame: 0.7,
    minusClock: 0,
    gameClock: Date.now(),
    init: [],
    preResetGame: function() {
        if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';
        g.currentLevel = "survival";
        g.helpers.fS = [];
        for (var i = -g.helpers.fakeLimit; i < g.helpers.fakeLimit; i++) {
            g.helpers.fS[i] = Math.sin(i / 100);
        }
        g.helpers.fC = [];
        for (var i = -g.helpers.fakeLimit; i < g.helpers.fakeLimit; i++) {
            g.helpers.fC[i] = Math.cos(i / 100);
        }
        g.ui.showTitleScreen();
        g.game.gameClock = Date.now();
        g.game.bindControls();
    },
    fail: function() {
        _gaq.push(['_trackEvent', 'Game', g.currentLevel, 'Score', g.game.score]);
        g.game.preResetGame();
    },
    resetGame: function() {
        g.game.gameClock = Date.now();
        g.game.score = 0;
        g.game.frame = 1.9;
        g.game.field.bgload();
        if(g.game.init.length) {
            for(var i = 0, il = g.game.init.length; i < il; i++){
                g.game.init[i]();
            }
        }
    },
    gameLogic: function() {
        g.levels[g.currentLevel]();
        g.game.player.logic();
        g.game.enemies.logic();
    },
    renderFrame: function() {
        g.game.field.render();
        g.game.enemies.render();
        g.game.player.render();
        g.ui.crosshair.render();
        g.ui.updateScore();

        if(!g.game.gameOn) {
            g.game.fail();
        }
    },
    startGame: function() {
        g.game.gameOn = true;
        g.game.logic = g.levels[g.currentLevel];
        g.game.resetGame();
        requestAnimationFrame(g.game.doFrame);
    },
    pauseIt: function() {
        g.game.gameClock = Date.now();
        g.game.paused = false;
        requestAnimationFrame(g.game.doFrame);
    },
    unPauseIt: function() {
        g.ui.showPausedScreen();
        g.game.paused = true;
        g.fpsCount = 0;
        g.fpsTimer = 0;
    },
    doFrame: function() {
        if(!g.game.gameOn || g.game.paused) return false;
        var newGameClock = Date.now();
        g.game.minusClock = newGameClock - g.game.gameClock;
        g.game.frame += (g.game.minusClock * 0.00002);
        g.fpsCount++;
        g.fpsTimer += g.game.minusClock;
        g.game.gameClock = newGameClock;
        g.game.gameLogic();
        g.game.renderFrame();
        requestAnimationFrame(g.game.doFrame);
    },
    bindControls: function() {
        document.onmousemove = function (event) {
            g.ui.crosshair.x = (event.pageX - g.game.field.offset.left) / g.canvasScale;
            g.ui.crosshair.y = (event.pageY - g.game.field.offset.top) / g.canvasScale;
        };
        document.onmousedown = function (event) {
            g.game.player.fireShot();
            g.game.player.firing = true;
            g.game.player.cooldown = 15;
            event.stopPropagation();
            return false;
        };
        document.onmouseup = function () {
            g.game.player.firing = false;
        };
        window.onkeydown = function (event) {
            switch (event.keyCode) {
            case 38:
            case 87:
                g.game.player.moveUp = true;
                break;
            case 37:
            case 65:
                g.game.player.moveLeft = true;
                break;
            case 39:
            case 68:
                g.game.player.moveRight = true;
                break;
            case 40:
            case 83:
                g.game.player.moveDown = true;
                break;
            case 32:
                if (!g.game.gameOn) {
                    g.game.startGame();
                } else {
                    if(g.game.paused) {
                        g.game.pauseIt();
                    } else {
                        g.game.unPauseIt();
                    }
                }
            }
        };
        window.onkeyup = function (event) {
            switch (event.keyCode) {
            case 38:
            case 87:
                g.game.player.moveUp = false;
                break;
            case 37:
            case 65:
                g.game.player.moveLeft = false;
                break;
            case 39:
            case 68:
                g.game.player.moveRight = false;
                break;
            case 40:
            case 83:
                g.game.player.moveDown = false;
                break;
            }
        };
    }
};

