;(function() {

window.g = window.g || {};

g = {
    shadowEnabled: true,
    canvasScale: 1,
    cwidth: 900,
    cheight: 600,
    fpsCount: 0,
    fpsTimer: 0,
    canvas: document.getElementById('gamecanvas'),
    bgcanvas: document.getElementById('bgcanvas')
};

g.ctx = g.canvas.getContext("2d");
g.bgctx = g.bgcanvas.getContext("2d");

g.canvas.setAttribute('width', g.cwidth);
g.canvas.setAttribute('height', g.cheight);
g.bgcanvas.setAttribute('width', g.cwidth);
g.bgcanvas.setAttribute('height', g.cheight);

function gameLogic() {
    g.game.player.logic();
    g.game.enemies.logic();
}

function renderFrame() {
    g.game.field.render();
    g.game.enemies.render();
    g.game.player.render();
    g.ui.crosshair.render();
    g.ui.updateScore();

    if(!g.game.gameOn) {
        g.game.fail();
    }
}

function doFrame() {
    if(!g.game.gameOn || g.game.paused) return false;
    var newGameClock = Date.now();
    g.game.minusClock = newGameClock - g.game.gameClock;
    g.game.frame += (g.game.minusClock * 0.00002);
    g.fpsCount++;
    g.fpsTimer += g.game.minusClock;
    g.game.gameClock = newGameClock;
    gameLogic();
    renderFrame();
    requestAnimationFrame(doFrame);
}
window.onload = function() {

    if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';
    g.ctx.fillStyle = "#000";
    g.ctx.fillRect(0, 0, g.cwidth, g.cheight);

    document.onmousemove = function (event) {
        g.ui.crosshair.x = (event.pageX - g.game.field.offset.left) / g.canvasScale;
        g.ui.crosshair.y = (event.pageY - g.game.field.offset.top) / g.canvasScale;
    };
    document.onmousedown = function (event) {
        g.game.player.fireShot();
        g.game.player.firing = true;
        g.game.player.cooldown = 20;
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
                g.game.gameOn = true;
                g.game.resetGame();
                requestAnimationFrame(doFrame);
            } else {
                if(g.game.paused) {
                    g.game.gameClock = Date.now();
                    g.game.paused = false;
                    requestAnimationFrame(doFrame);
                } else {
                    g.ui.showPausedScreen();
                    g.game.paused = true;
                    g.fpsCount = 0;
                    g.fpsTimer = 0;
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
    g.game.preResetGame();
    g.game.resetGame();
}

})();