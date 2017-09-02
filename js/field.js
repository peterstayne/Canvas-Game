g.game.field = {
    width: g.cwidth,
    height: g.cheight,
    offset: g.helpers.findOffset(g.renderer.canvas),
    image: 'gravel.png',
    render: function() {
        g.renderer.ctx.shadowColor = 'rgba(0,0,0,0)';
        g.renderer.canvas.width = g.renderer.canvas.width;
    },
    bgload: function() {
        var theimg = document.getElementById('bgimg');
        g.game.field.bgimg = {
            img: theimg,
            width: theimg.width,
            height: theimg.height
        };
        g.renderer.bgctx.drawImage(g.game.field.bgimg.img, 0, 0, g.game.field.bgimg.width, g.game.field.bgimg.height, 0, 0, g.cwidth, g.cheight);
    }
};

