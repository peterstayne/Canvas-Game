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
        g.ctx.shadowColor = 'rgba(0,0,0,0)';

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
        g.ctx.shadowColor = 'rgba(0,0,0,0)';
    },
	showTitleScreen: function() {
        var centerX = g.cwidth >> 1;
        var titleY = ~~(g.cheight * 0.48);
        var pressSpaceY = ~~(g.cheight * 0.75);

        g.ctx.shadowColor = 'rgba(0,0,0,0)';

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
    },
    showPausedScreen: function() {
	    g.ui.drawText({ text: "PAUSED", size: 60, color: "#538" });
	    g.ui.drawText({ text: "Press space to unpause.", y: (g.cheight >> 1) + 100  });
	},
    crosshair: {
        x: 0,
        y: 0,
        render: function() {
            g.ctx.shadowColor = 'rgba(0,0,0,0)';
            g.ctx.strokeStyle = "#0ff";
            g.ctx.strokeRect(g.ui.crosshair.x - 4, g.ui.crosshair.y - 4, 8, 8);
        }
    }
};