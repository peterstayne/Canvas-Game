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
    cAspectRatio: 1.5,
    cwidth: 900,
    cheight: 600,
    fpsCount: 0,
    fpsTimer: 0,
    canvas: document.getElementById('gamecanvas'),
    bgcanvas: document.getElementById('bgcanvas')
};

g.ctx = g.canvas.getContext("2d");
g.bgctx = g.bgcanvas.getContext("2d");

window.addEventListener('load', function() {
    resizeWindow();
    g.game.preResetGame();
    g.game.resetGame();
});

var winWidth = null;
var winHeight = null;

window.addEventListener('resize', resizeWindow);

function resizeWindow() {
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
    if(winWidth / winHeight > g.cAspectRatio) {
        g.cwidth = ~~(winHeight * g.cAspectRatio);
        g.cheight = winHeight;
    } else {
        g.cheight = ~~(winWidth / g.cAspectRatio);
        g.cwidth = winWidth;
    }

    document.body.style.width = g.cwidth + 'px';

    g.game.field.width = g.cwidth;
    g.game.field.height = g.cheight;

    g.canvas.setAttribute('width', g.cwidth);
    g.canvas.setAttribute('height', g.cheight);
    g.bgcanvas.setAttribute('width', g.cwidth);
    g.bgcanvas.setAttribute('height', g.cheight);

    g.game.field.offset = g.helpers.findOffset(g.canvas)
}


})();

