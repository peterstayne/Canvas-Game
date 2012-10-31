g.game = {
    score: 0,
    gameOn: false,
    paused: false,
    frame: 0.7,
    minusClock: 0,
    gameClock: Date.now(),
    init: [],
    preResetGame: function() {
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
    },
    fail: function() {
        _gaq.push(['_trackEvent', 'Game', 'Death', 'Score', g.game.score]);
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
    }
};

