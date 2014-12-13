;(function() {

window.g = window.g || {};

// empty GA object to satisfy Closure Advanced Optimizations
window._gaq = window._gaq || {
    push: function() {
        return false;
    }
};

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

window.onload = function() {

    g.game.preResetGame();
    g.game.resetGame();
}

})();

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;
window.onresize = function() {
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
    
}