g.game.field = {
    width: g.cwidth,
    height: g.cheight,
    offset: g.helpers.findOffset(g.canvas),
    image: 'gravel.png',
    render: function() {
        if(g.shadowEnabled) g.ctx.shadowColor = 'rgba(0,0,0,0)';
        g.canvas.width = g.canvas.width;
    },
    bgload: function() {
        var theimg = document.getElementById('bgimg');
        g.game.field.bgimg = {
            img: theimg,
            width: theimg.width,
            height: theimg.height
        };
        g.bgctx.drawImage(g.game.field.bgimg.img, 0, 0, g.game.field.bgimg.width, g.game.field.bgimg.height, 0, 0, g.cwidth, g.cheight);
    }
};

