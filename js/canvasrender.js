canvasRender = {
    canvas: null,
    bgcanvas: null,
	init: function() {
		this.canvas	= document.getElementById('gamecanvas');
		this.bgcanvas = document.getElementById('bgcanvas');
		this.ctx = g.renderer.canvas.getContext("2d");
		this.bgctx = g.renderer.bgcanvas.getContext("2d");
	},
	resizeWindow: function() {
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

	    this.canvas.setAttribute('width', g.cwidth);
	    this.canvas.setAttribute('height', g.cheight);
	    this.bgcanvas.setAttribute('width', g.cwidth);
	    this.bgcanvas.setAttribute('height', g.cheight);
	    g.game.field.bgload();
	    if(g.game.gameOn) {
	        g.game.renderFrame();
	        if(g.game.paused) {
	            g.ui.showPausedScreen();
	        }
	    } else {
	        g.ui.showTitleScreen();
	    }
	    g.game.field.offset = g.helpers.findOffset(this.canvas);
	}
};

