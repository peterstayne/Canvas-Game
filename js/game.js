
g.game = {
    score: 0,
    gameOn: false,
    paused: false,
    frame: 0.7,
    minusClock: 0,
    gameClock: Date.now(),
    init: [],
    preResetGame: function() {
        var centerX = g.cwidth >> 1;
        var titleY = ~~(g.cheight * 0.48);
        var pressSpaceY = ~~(g.cheight * 0.75);

        g.helpers.fS = [];
        for (var i = -g.helpers.fakeLimit; i < g.helpers.fakeLimit; i++) {
            g.helpers.fS[i] = Math.sin(i / 100);
        }
        g.helpers.fC = [];
        for (var i = -g.helpers.fakeLimit; i < g.helpers.fakeLimit; i++) {
            g.helpers.fC[i] = Math.cos(i / 100);
        }

        if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';

        g.ctx.textBaseline = "alphabetic";
        g.ctx.fillStyle = "rgba(0,0,0,0.7)";
        g.ctx.fillRect(centerX - 255, titleY - 88, 510, 106);

        g.ctx.font = "98px arial";
        g.ctx.fillStyle = "#538";
        g.ctx.textAlign = "center";
        g.ctx.fillText("SQUARE'D", centerX, titleY);

        g.ctx.font = "100px arial";
        g.ctx.lineWidth = 1;
        g.ctx.strokeStyle = "#a7f";
        g.ctx.textAlign = "center";
        g.ctx.strokeText("SQUARE'D", centerX, titleY);

        g.ui.drawText({
           "text": "Press space to start",
           "y": pressSpaceY - 18
        });
        g.ui.drawText({
           "text": "Controls: Arrow keys or W, A, S, D to move; Mouse to aim and fire",
           "y": pressSpaceY + 18
        });
        g.game.gameClock = Date.now();
    },
    fail: function() {
        g.game.preResetGame();
    }
};

