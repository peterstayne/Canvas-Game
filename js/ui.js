g.ui = {
    drawText: function(params) {
        // params:
        // text: the text of the string to display.
        // color: color of the text (any css format)
        // align: "left", "center", "right"
        // size: must be integer, px of font size.
        // x: (optional) default will be to center for center align
        // y: (optional) default will be to center row
        var defaults = {
            "color": "#fff",
            "align": "center",
            "size": 15,
            "x": g.cwidth >> 1,
            "y": g.cheight >> 1
        };
        for(var i in defaults) {
            params[i] = params[i] ? params[i] : defaults[i];
        }
        if(params.text === undefined || !params.text.length) {
            return false;
        }
        if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';

        g.ctx.font = params.size + "px arial";
        var thisTextWidth = g.ctx.measureText(params.text).width;

        g.ctx.fillStyle = "rgba(0,0,0,0.7)";
        g.ctx.fillRect(params.x - (thisTextWidth >> 1)- 10, params.y - 8, thisTextWidth + 17, params.size + 18);

        g.ctx.textAlign = params.align;
        g.ctx.textBaseline = "top";
        g.ctx.fillStyle = params.color;
        g.ctx.fillText(params.text, params.x, params.y);
    },
	updateScore: function() {
        g.ui.drawText({
            color: "#f0f",
            text: "Score: " + g.game.score,
            x: 80,
            y: 30
        });
        var curFPS = ~~(g.fpsCount / (g.fpsTimer / 1000));
        g.ui.drawText({
            color: "#f0f",
            text: "FPS: " + curFPS,
            x: 80,
            y: 55
        });
        if(g.shadowEnabled && curFPS < 50 && g.fpsTimer > 10000) {
            ctx.shadowColor = 'rgba(0,0,0,0)';
            g.shadowEnabled = false;
        }
    },
    crosshair: {
        x: 0,
        y: 0,
        render: function() {
            if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';
            g.ctx.strokeStyle = "#0ff";
            g.ctx.strokeRect(g.ui.crosshair.x - 4, g.ui.crosshair.y - 4, 8, 8);
        }
    }
};