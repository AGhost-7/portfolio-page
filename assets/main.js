(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/* This file contains a series of generic functions to manipulate 2 dimensional
 * arrays.
 */
module.exports = {

  /* Generates a 2 dimensional array.
   * @fill can be a function or some other value. Function is executed for each
   * element and its output determines the value on the array.
   */
  fill: function() {

    var
      arr = arguments.length > 3 ? arguments[0] : new Array(width),
      width = arguments.length > 3 ? arguments[1] : arguments[0],
      height = arguments.length > 3 ? arguments[2] : arguments[1],
      fill = arguments.length > 3 ? arguments[3] : arguments[2],
      fillType = typeof fill;

    for(var x = 0; x < arr.length; x++) {
      arr[x] = new Array(height);
      if(fillType != 'undefined'){
        for(var y = 0; y < height; y++) {
          if(fillType == 'function') {
            arr[x][y] = fill(x, y);
          } else {
            arr[x][y] = fill;
          }
        }
      }
    }
    return arr;
  },

  /* Generates a new 2dim array from the result of the function against each
   * element in the array.
   * @func takes element, x, y, and array parameters, returning the new mapped
   * value.
   */
  map: function(arr, func) {
    var copy = new Array(arr.length);
    for(var x = 0; arr.length; x++) {
      copy[x] = new Array(arr[x].length);
      for(var y = 0; y < arr[x].length; y++) {
        copy[x][y] = func(arr[x][y], x, y, copy);
      }
    }
    return copy;
  },

  /* Iterates over each element in the 2dim array and calls the function against
   * them.
   * @func takes element, x, y, and array parameters.
   */
  forEach: function(arr, func) {
    for(var x = 0; x < arr.length; x++) {
      for(var y = 0; y < arr[x].length; y++) {
        func(arr[x][y], x, y, arr);
      }
    }
  },

  /* Find the point nearest to the given coordinate, given coordinate excluded.
   * This function tries to find a match as fast as possible, instead of trying
   * to be 100% correct. Returns undefined if nothing found.
   * @check is a function which takes point, x, and y parameters, returning true
   * if the point is a match.
   */
  findNearest: function(graph, x, y, check) {
    var
      xP, yP, xN, yN,
      xP2, yP2, xN2, yN2,
      matrix,
      push, push2,
      xCheck, yCheck, iCheck;

    var
      wPushCap = x < (graph.length - x) ? graph.length - x : x,
      hPushCap = y < (graph[0].length - y) ? graph[0].length - y : y
      pushCap = wPushCap < hPushCap ? hPushCap : wPushCap;

    for(push = 0; push <= pushCap; push++) {
      // crosspoints = [xP; y], [xN; y], [x; yP], [x; yN]
      xP = x + push;
      yP = y + push;
      xN = x - push;
      yN = y - push;

      for(push2 = 0; push2 <= push; push2++) {
        xP2 = x + push2;
        yP2 = y + push2;
        xN2 = x - push2;
        yN2 = y - push2;

        matrix = [
          [xP, yP2], [xP, yN2], // x+
          [xP2, yN], [xN2, yN], // y-
          [xN, yP2], [xN, yN2], // x-
          [xN2, yP], [xP2, yP] // y+
        ];

        for(iCheck = 0; iCheck < matrix.length; iCheck++) {
          xCheck = matrix[iCheck][0];
          yCheck = matrix[iCheck][1];

          if(xCheck < 0
              || yCheck < 0
              || xCheck >= graph.length
              || yCheck >= graph[0].length
              || (xCheck === x && yCheck === y)) {
            continue;
          }

          if(check(graph[xCheck][yCheck], xCheck, yCheck, graph)) {
            return graph[xCheck][yCheck];
          }
        }
      }
    }
  },

  /* Test against an element at a randomly picked position on the array. Returns
   * the value if the test returns truthy.
   */
  findRand: function(arr, check) {
    var x, y;
    while(true) {
      x = Math.floor(Math.random() * arr.length);
      y = Math.floor(Math.random() * arr[0].length);
      if(check(arr[x][y])) {
        return arr[x][y];
      }
    }
  }
}

},{}],2:[function(require,module,exports){

/* Image manager for the ghost character.
 */


var imageSources = {
  down: 'assets/ghost_down.png',
  up: 'assets/ghost_up.png',
  left: 'assets/ghost_left.png',
  right: 'assets/ghost_right.png'
};

var ghost = {};
var imagesLoaded = 0;
for(var key in imageSources) {
  ghost[key] = new Image;
  ghost[key].src = imageSources[key];
  ghost[key].onload = function() {
    imagesLoaded++;
    if(imagesLoaded === 4) {
      module.exports.height = 0.3 * ghost[key].height;
      module.exports.width = 0.3 * ghost[key].width;
      //console.log('ghost dimensions', module.exports.height, module.exports.width)
      module.exports.onload();
      // resize();
      // requestAnimationFrame(draw);
    }
  };
}

var lastGhost = ghost.down;
module.exports = {

  /* Returns the image which should be used to draw the character based on the
   * arrow directions.
   */
  fromDirection: function (direction) {
    var res;
    if(direction.x === 1) res = ghost.right;
    else if(direction.x === -1) res = ghost.left;
    else if(direction.y === 1) res = ghost.down;
    else if(direction.y === -1) res = ghost.up;
    else res = lastGhost;

    lastGhost = res;
    return res;
  },

  /* Function is called when all images have loaded.
   */
  onload: function() { }
};

},{}],3:[function(require,module,exports){

/* Contains the data for generating the model representation of the game map.
 * No drawing logic here.
 */

var dim2 = require('./dim2');

/* Represents a point in the graph. Structure isn't all that useful atm, mainly
 * created for easily adding fields to graph members without having to update
 * existing functions.
 */
function Point(x, y, isPath){
  this.x = x;
  this.y = y;
  // A path represents where the player can walk.
  this.isPath = isPath === undefined ? false : isPath;
  // There is only one portal in the "game" atm.
  this.isPortal = false;
  // A node is the random seed, while a path can be the random seed or what
  // connects the random seed to the node.
  this.isNode = false;
}

/* Generates a random true or false.
 */
function randBool() { return (Math.random() * 2) >= 1 }

/* Generates a 2 dimensional unsigned int array with random points!
 * @min is the minimum number of points.
 * @max is the maximum number of points.
 */
function genRandNodes(width, height, min, max) {
  //var graph = new Graph(width, height);

   var graph = dim2.fill(new Array(width), width, height, function(x, y) {
     return new Point(x, y);
   });

  min = min ? min : Math.floor(width * height / 15) + 1;
  max = max ? max : Math.floor(width * height / 14) + 1;

  var points = min + Math.floor(Math.random() * (max - min + 1));
  var x, y;
  while(points > 0){
    x = Math.floor(Math.random() * width);
    y = Math.floor(Math.random() * height);

    if(!graph[x][y].isPath){
      points -= 1;
      graph[x][y].isPath = true;
      graph[x][y].isNode = true;
    }
  }

  return graph;
}

/* Find a point which is unconnected. x and y is the point of the portal.
 */
function findUnconnected(graph, x, y) {
  return dim2.findNearest(graph, x, y, function(p, x, y) {
    //console.log(p)
    return p.isNode && !p.isConnected;
  })
}

/* This will take the unconnected node and connect is to a nearby node which is
 * actually connected to the portal.
 * @unc is the unconnected node.
 */
function connectToConnected(graph, unc) {

  var con = dim2.findNearest(graph, unc.x, unc.y, function(p, x, y) {
    return p.isConnected || p.isPortal;
  });

  if(con === undefined) throw 'No connected point not found.';

  if(randBool()) connectFromY(graph, unc, con);
  else connectFromX(graph, unc, con);

}

/* from y, walk all the way up to the coordinate on the y axis, then
 * walk to the connected node's x axis.
 */
function connectFromY(graph, unc, con) {
  var inc = con.y - unc.y < 0 ? -1 : 1;

  for(var y = unc.y; y != con.y; y += inc) {
    graph[unc.x][y].isPath = true;
    graph[unc.x][y].isConnected = true;
  }

  inc = con.x - unc.x < 0 ? -1 : 1;
  for(var x = unc.x; x != con.x; x += inc) {
    graph[x][con.y].isPath = true;
    graph[x][con.y].isConnected = true;
  }
}

/* Other way around...
 */
function connectFromX(graph, unc, con) {
  var inc = con.x - unc.x < 0 ? -1 : 1;
  for(var x = unc.x; x != con.x; x += inc) {
    graph[x][unc.y].isPath = true;
    graph[x][unc.y].isConnected = true;
  }
  inc = con.y - unc.y < 0 ? -1 : 1;
  for(var y = unc.y; y != con.y; y += inc) {
    graph[con.x][y].isPath = true;
    graph[con.x][y].isConnected = true;
  }
}



module.exports = function(width, height) {

  // The basic idea for this algorithm is to generate random points and then to
  // join them together.
  var graph = genRandNodes(width, height);

  // now I need to create the portal.
  var portal = dim2.findRand(graph, function(p) {
    if(!p.isPath) {
      p.isPortal = true;
      return true;
    }
  });

  // find the nearest unconnected node and connect it either to the portal or the
  // nearest connected node.
  var unc;
  while(unc = findUnconnected(graph, portal.x, portal.y)) {
    connectToConnected(graph, unc);
  }

  return graph;
};

},{"./dim2":1}],4:[function(require,module,exports){

var dim2 = require('./js/dim2'),
  graph = require('./js/graph'),
  ghost = require('./js/ghost');

window.requestAnimationFrame =
    window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame;

if(window.requestAnimationFrame === undefined) {
  alert('Browser is not supported');
  throw 'Cannot request animation frame';
}

var
  pointer = undefined,
  currentDirection = { x: 0, y: 0 },
  lastMillis = Date.now(),
  keysPressed = [],
  panel = document.getElementById('panel'),
  map = undefined,
  canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d'),
  closeBtn = document.getElementById('close-btn');

closeBtn.onclick = function() {
  document.getElementById('panel').style.visibility = 'hidden';
};

ghost.onload = function() {
  resize();
  initializeMap();
  requestAnimationFrame(draw);
};

window.onkeydown = function(ev){
  var key = ev.which || ev.keyCode,
    index = keysPressed.indexOf(key);

  if(index == -1) {
    keysPressed.push(key);
    currentDirection = getDirection(keysPressed);
  }
};

window.onkeyup = function(ev){
  var key = ev.which || ev.keyCode,
    index = keysPressed.indexOf(key);
  if(index > -1){
    keysPressed.splice(index, 1);
    currentDirection = getDirection(keysPressed);
  }
};

/* Starts up a "game" with the character being placed on the map.
 */
function initializeMap() {

  map = graph(Math.floor(canvas.width / 55), Math.floor(canvas.height / 55));

  // determine where the ghost starts
  startPoint = dim2.findRand(map, function(p) {
    return p.isPath && !p.isPortal;
  });

  pointer = {
    x: Math.floor(canvas.width / map.length) * startPoint.x,
    y: Math.floor(canvas.height / map[0].length) * startPoint.y
  };

}

/* Adjust the canvas size to prevent weird pixelation.
 */
function resize(){
  var panelY = (window.innerHeight - panel.clientHeight) / 2,
    panelX = (window.innerWidth - panel.clientWidth) / 2;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // total - panel's / 2
  panel.style.top = panelY + 'px';
  panel.style.left = panelX;
}

function keyPressed(key){
  return keysPressed.indexOf(key) > -1
}

function getDirection(keysPressed){
  var dir = {x: 0, y: 0};

  if(keyPressed(87) || keyPressed(38)) dir.y -= 1;
  if(keyPressed(40)	|| keyPressed(83)) dir.y += 1;
  if(keyPressed(37) || keyPressed(65)) dir.x -= 1;
  if(keyPressed(39) || keyPressed(68)) dir.x += 1;

  return dir;
}

window.onresize = resize;

/* Returns the status of the game. The player can only be in three different
 * states - dead, alive, or has won the game.
 * @p is the coordinate of the ghost on the canvas.
 */
function getGameStatus(p, map) {
  var tests = [
    p,
    { x: p.x + ghost.width, y: p.y },
    { x: p.x, y: p.y + ghost.height },
    { x: p.x + ghost.width, y: p.y + ghost.height }
  ];
  var point;
  for(var i = 0; i < tests.length; i++) {
    point = map[Math.floor(tests[i].x / 55)][Math.floor(tests[i].y / 55)];
    if(point.isPortal) return 'won';
    else if(!point.isPath) return 'dead';
  }
  return 'ok';
}

function draw(){
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  drawMap(ctx, map);

  var millis = Date.now();
  var millisDiff = Math.floor((millis - lastMillis) / 6);

  pointer.x += currentDirection.x * millisDiff;
  pointer.y += currentDirection.y * millisDiff;

  var status = getGameStatus(pointer, map);
  if(status == 'won') {
    initializeMap();
    draw();
    return;
  } else if(status == 'dead') {
    throw 'dead...'
  }

  var modulo = Math.floor((millis % 2000) / 80);
  var floatOffset = modulo > 12 ? 12 - (modulo - 12) : modulo;

  ctx.drawImage(
      ghost.fromDirection(currentDirection),
      pointer.x,
      pointer.y + floatOffset,
      ghost.width,
      ghost.height
      );

  lastMillis = millis;

  requestAnimationFrame(draw);
}

/* Will draw the game map graph :D
 * TODO: Make this handle uneven height/width better... atm I just need it to
 * draw the paths to see what I'm doing.
 */
function drawMap(ctx, graph){
  // multiplier.
  var xM = Math.floor(ctx.canvas.width / (graph.length)),
    yM = Math.floor(ctx.canvas.height / (graph[0].length));

  dim2.forEach(graph, function(point, x, y) {
    if(point.isPath) {
      if((point.isNode && !point.isConnected))
        ctx.fillStyle = 'red';
      else
        ctx.fillStyle = 'grey';
      ctx.fillRect(x * xM, y * yM, xM, yM);
    } else if(point.isPortal) {
      ctx.fillStyle = 'blue';

      ctx.fillRect(x * xM, y * yM, xM, yM);
    }
  });
}

},{"./js/dim2":1,"./js/ghost":2,"./js/graph":3}]},{},[4]);
