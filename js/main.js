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

    if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';
    g.ctx.fillStyle = "#000";
    g.ctx.fillRect(0, 0, g.cwidth, g.cheight);

    g.game.preResetGame();
    g.game.resetGame();
}

})();