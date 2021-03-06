Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox();
    var bb2 = obj2.getBBox();
    var p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}];
    var d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        var res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y,
        dx = Math.max(Math.abs(x1 - x4) / 2, 10),
        dy = Math.max(Math.abs(y1 - y4) / 2, 10),
        x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#000";
        var cns = {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none"}),
            from: obj1,
            to: obj2
        };
        if(!obj1.connections){
          obj1.connections = []
        }
        if(!obj2.connections){
          obj2.connections = []
        }
        obj1.connections.push(cns);
        obj2.connections.push(cns);
        
        return cns;
    }
};

var el, r, connections = [], shapes = [], dragger;

function get_subkeys(name){
  var allkeys = wave.getState().getKeys();
  var subkeys = []
  for(var i = 0; i < allkeys.length; i++){
    if(allkeys[i].indexOf(name) == 0){
      subkeys.push(allkeys[i].substr(name.length))
    }
  }
  return subkeys
}

function a2assoc(arr){
  for(var i = 0, asc = {}; i < arr.length; i++){
    asc[arr[i]] = 1//fill?wave.getState().get(fill+arr[i]):1;
  }
  return asc;
}

function wave_set(row, value){
  if(!window.wave)return;
  var delta = {}
  delta[row] = value;
  wave.getState().submitDelta(delta)
}


function statechange(){
  if(has_init == false){init_edit()}

  var cns = a2assoc(get_subkeys('c/'));
  var txs = a2assoc(get_subkeys('s/'));
  
  for(var i in txs){
    //dat
    var dat = wave.getState().get('s/'+i).split(":"); 
    
    if(texts[i]){
      //edit
      if(texts[i].attr("x")!=parseInt(dat[0]) || texts[i].attr("y") != parseInt(dat[1])){
        //yaaaaaaaay
        texts[i].animate({
          x: parseInt(dat[0]),
          y: parseInt(dat[1])
        }, 500, function(){
          for (var i = this.connections.length; i--;) {
          r.connection(this.connections[i]);
          }
        })
        
        
        //texts[i].attr("x", parseInt(dat[0]));
        //texts[i].attr("y", parseInt(dat[1]));
      }
    }else{
      //no existy then creaty
      var ts = r.text(parseInt(dat[0]), parseInt(dat[1]), i);
      setShape(ts);
    }
  }

  var tca = {};
  for(var i = 0; i < connections.length; i++){
    if(!connections[i].txt){
      var txt = connections[i].from.attr("text")+"~"+connections[i].to.attr("text")
      connections[i].txt = txt;
      tca[txt] = 1;
    }else{
      tca[connections[i].txt] = 1
    }
  }
  
  for(var i in cns){
    if(!tca[i]){
      
      var dat = i.split("~")//wave.getState().get('c/'+i).split("~");
      if(texts[dat[0]] && texts[dat[1]]){
        connections.push(r.connection(texts[dat[0]], texts[dat[1]], "#fff"));
      }else{
        r.text(Math.random()*600,Math.random()*600,"Error, no el for connect:"+dat[0] +" OR "+dat[1]).attr("stroke","white");
      }
    }
  }
}




function save(){
  var cns = []
  for(var i = 0; i < connections.length; i++){
    if(!connections[i].txt){
      var txt = connections[i].from.attr("text")+"~"+connections[i].to.attr("text")
      connections[i].txt = txt;
    }else{
      var txt = connections[i].txt
    }
    cns.push(txt);
  }
  var sh = [];
  for(var i in texts){
    sh.push(i+":"+texts[i].attr("x")+":"+texts[i].attr("y"))
  }
  return [cns,sh]
}

function urisave(){
  if(!window.wave){
      setTimeout(function(){
              var sv = save();
        window.location.hash = "#"+sv[0].join(",")+"_____"+sv[1].join(",");
      }, 100);
  }
}

function open(cns, sh){
  for(var i = 0; i < sh.length; i++){
    var dat = sh[i].split(":");
    if(!texts[dat[0]]){
      var ts = r.text(parseInt(dat[1]), parseInt(dat[2]), dat[0]);
      setShape(ts);
    }else{
      texts[dat[0]].attr("x", parseInt(dat[1]));
      texts[dat[0]].attr("y", parseInt(dat[2]));
    }
  }
  var nowcns = save()[0]; 
  
  if(!nowcns.indexOf){ //ie hax?
    nowcns = nowcns.join(";");
  }
  for(var i = 0; i < cns.length; i++){
    if(nowcns.indexOf(cns[i]) == -1){
      //if no connection
      var dat = cns[i].split("~");
      connections.push(r.connection(texts[dat[0]], texts[dat[1]], "#fff"));
    } //else do ntin
  }
}
var has_init = false;
var texts = {};

    var isDrag = false;
    
window.onresize = function(){
  var w = Math.max(document.documentElement.clientWidth,3000)
  var h = Math.max(document.documentElement.clientHeight,2000);
  
  document.getElementById("holder").style.width = w+"px"
  document.getElementById("holder").style.height = h+"px"
  if(window.r){
    r.setSize(w, h)
  }
}

function genrand(adder){
  var rna = Math.round(Math.random()*400)-200; //take out the 0s and you get life.
  if(Math.abs(rna) < 42 || rna+adder < 10){
    return genrand(adder); //yay recursion
  }
  return rna+adder;
}

function setShape(shape){
  texts[shape.attr("text")] = shape;
  var color = Raphael.getColor();
  shape.attr({fill: color, stroke: color, "font-size": 12, "fill-opacity": 0, "stroke-width": 1});
  shape.node.style.cursor = "move";
  shape.mousedown(dragger);
  shape.dblclick(function(e){
    e.stopPropagation()
    var text = prompt("Associate "+this.attr("text")+" with what?");
    if(!text || text == this.attr("text")){return}
    if(!this.connections){
      this.connections = [];
    }
    
    var change = false;
    if(texts[text]){
      change = true;
    }else{
      for(var e in texts){
        if(e.toLowerCase() == text.toLowerCase()){
          change = true;
          text = e;
          break;
        }
      }
    }
    
    if(change){
      
      connections.push(r.connection(this, texts[text], "#fff"));
      
      wave_set("c/"+this.attr("text") + "~" + text, 1);
      
      
      urisave()  
    }else{
      var ts = r.text(genrand(this.attr("x")), genrand(this.attr("y")), text);
      setShape(ts);
      
      connections.push(r.connection(this, ts, "#fff"));
      
      wave_set("c/"+this.attr("text") + "~" + text, 1);
      wave_set("s/"+text, ts.attr("x")+":"+ts.attr("y"));
      
      urisave()
    }
  })
}

function init_edit() {
has_init = true;
    dragger = function (e) {
        this.dx = e.clientX;
        this.dy = e.clientY;
        if(this.pset){
          isDrag = this.pset;
        }else{
          isDrag = this;
        }
        this.animate({"fill-opacity": .2}, 500);
        e.preventDefault && e.preventDefault();
    };
    r = Raphael("holder", Math.max(document.documentElement.clientWidth,3000), Math.max(document.documentElement.clientHeight,2000));
    window.onresize();
    if(window.location.hash.length > 3 && !window.wave){
      var parts = window.location.hash.substr(1).split("_____");
      open(unescape(parts[0]).split(","), unescape(parts[1]).split(","));
    }else{
    if(!window.wave || (get_subkeys("").length == 0 && wave.getViewer().getId() == wave.getHost().getId())){
    var ttmp = "";
    shapes = [  
                r.text(200, 200, (ttmp=prompt("Root Text Node (The starting node)","start"))?ttmp:"start")
                //r.text(200,200,"cat"),
                //r.text(100,100,"dog"),
            ];
    
   // wave_set("c/"+this.attr("text") + "~" + text, 1);
    wave_set("s/"+shapes[0].attr("text"), shapes[0].attr("x")+":"+shapes[0].attr("y"));
    
    for (var i = 0, ii = shapes.length; i < ii; i++) {
        setShape(shapes[i])
    }
    
    //connections.push(r.connection(shapes[0], shapes[1], "#fff"));
    
    }
    }
    
    document.ondblclick = function(e) {
      var ttmp = prompt("Unlinked Node Text");
      
        if(texts[ttmp]){
          return
        }else{
          for(var z in texts){
            if(z.toLowerCase() == ttmp.toLowerCase()){
              return;
            }
          }
        }
    
        if(ttmp){
        shapes = [  
                    r.text(e.clientX, e.clientY, ttmp)
                ];
        
        wave_set("s/"+shapes[0].attr("text"), shapes[0].attr("x")+":"+shapes[0].attr("y"));
        
        for (var i = 0, ii = shapes.length; i < ii; i++) {
            setShape(shapes[i])
        }
      }
    
    }
    
    document.onmousemove = function (e) {
        e = e || window.event;
        if (isDrag) {
            isDrag.translate(e.clientX - isDrag.dx, e.clientY - isDrag.dy);
            if(!isDrag.connections){
              isDrag.connections = [];
            }
            for (var i = isDrag.connections.length; i--;) {
                r.connection(isDrag.connections[i]);
            }
            
            r.safari();
            isDrag.dx = e.clientX;
            isDrag.dy = e.clientY;
        }
    };
    
    
    
    document.onmouseup = function () {
        isDrag && isDrag.animate({"fill-opacity": 0}, 500);
        if(isDrag){
          wave_set("s/"+isDrag.attr('text'), isDrag.attr("x")+":"+isDrag.attr("y"));
        }
        isDrag = false;
        urisave()
    };
    
};


if(window.wave){
//nutin
window.onload = function(){init()}
}else{
window.onload = init_edit
}
