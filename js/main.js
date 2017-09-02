;(function() {

window.g = window.g || {};

// empty GA object to satisfy Closure Advanced Optimizations
window._gaq = window._gaq || {
    push: function() {
        return false;
    }
};

g = {
    canvasScale: 1,
    cAspectRatio: 1.5,
    cwidth: 900,
    cheight: 600,
    fpsCount: 0,
    fpsTimer: 0,
    loaded: false
};

g.renderer = canvasRender;

g.renderer.init();

window.addEventListener('load', function() {
    g.renderer.resizeWindow();
    g.game.preResetGame();
    g.game.resetGame();
    window.addEventListener('resize', g.renderer.resizeWindow);
});

var winWidth = null;
var winHeight = null;

})();

