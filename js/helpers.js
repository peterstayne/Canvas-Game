g.helpers = {
    pi: Math.PI,
    piHalf: Math.PI / 2,
    piQuarter: Math.PI / 4,
    piDouble: Math.PI * 2,
    fC: null,
    fS: null,
    fakeLimit: (Math.PI * 400) >> 0,
    findDistance: function (x1, y1, x2, y2) {
        var dist;
        var x = x1 - x2;
        var y = y1 - y2;
        x = x * x;
        y = y * y;
        return Math.sqrt(x + y);
    },
    findOffset: function(obj) {
        return {
            left: (window.innerWidth / 2) - (obj.width / 2),
            top: obj.offsetTop
        };
    },
    objectCopy: function(o){ //http://jsperf.com/deep-object-copy-vs-json
      if(!o){return {};}
      var key,
          ret={};
      for(key in o){
         if(o.hasOwnProperty(key)){
             ret[key]= g.helpers.objectCopyHelp(o[key]);
         }
      }
      return ret;
    },
    objectCopyHelp: function(v){
        if(Array.isArray(v)){
            return v.map(g.helpers.ObjectCopyHelp);
        }
        if(typeof v==="object"){ 
            return manual(v);
        }
        
        return v;
    }
};