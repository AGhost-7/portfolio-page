(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/* This file contains a series of generic functions to manipulate 2 dimensional
 * arrays.
 */
module.exports = {

  /* Generates a 2 dimensional array.
   * @fill can be a function or some other value. Function is executed for each
   * element and its output determines the value on the array.
   */
  fill: function(width, height, fill) {
    var arr = new Array(width),
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
   * This function tries to find a match as fast as possible, instead of trying to
   * be 100% correct. Returns undefined if nothing found.
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

    for(push = 0; push < pushCap; push++) {
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
  }
}

},{}],2:[function(require,module,exports){

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
  var graph = dim2.fill(width, height, function(x, y) {
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
  //console.log('findUnconnected: ', x, y)
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

  if(randBool()) {
    // from y, walk all the way up to the coordinate on the y axis, then
    // walk to the connected node's x axis.
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

  } else {
    // other way around...
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
}

module.exports = function(width, height) {
  // The basic idea for this algorithm is to generate random points and then to
  // join them together.
  var graph = genRandNodes(width, height);

  // now I need to create the portal.
  var x, y;
  while(true) {
    x = Math.floor(Math.random() * width);
    y = Math.floor(Math.random() * height);
    if(!graph[x][y].isPath) {
      graph[x][y].isPortal = true;
      break;
    }
  }

  // find the nearest unconnected node and connect it either to the portal or the
  // nearest connected node.
  var unc;
  while(unc = findUnconnected(graph, x, y)) {
    connectToConnected(graph, unc);
  }

  return graph;
};

},{"./dim2":1}],3:[function(require,module,exports){

var dim2 = require('./js/dim2'),
  graph = require('./js/graph');

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
  ghost = new Image,
  pointer = { x: 50, y: window.innerHeight - 200 },
  currentDirection = { x: 0, y: 0 },
  lastMillis = Date.now(),
  keysPressed = [],
  panel = document.getElementById('panel'),
  map = graph(50, 50),
  canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d');

function resize(){
  var panelY = (window.innerHeight - panel.clientHeight) / 2,
    panelX = (window.innerWidth - panel.clientWidth) / 2;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //ctx.canvas.width = canvas.width;
  //ctx.canvas.height = canvas.height;

  // total - panel's / 2
  panel.style.top = panelY + 'px';
  panel.style.left = panelX;
}

ghost.src = 'assets/ghost-sm.png';
ghost.onload = function(){
  resize();
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

function draw(){
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  drawMap(ctx, map);

  var millis = Date.now();
  var millisDiff = millis - lastMillis;

  pointer.x += currentDirection.x * millisDiff;
  pointer.y += currentDirection.y * millisDiff;

  var modulo = Math.floor((millis % 2000) / 50);
  var floatOffset = modulo > 20 ? 20 - (modulo - 20) : modulo;



  ctx.drawImage(ghost, pointer.x, pointer.y + floatOffset, ghost.width * 0.08, ghost.height * 0.08);

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
      if(point.isNode)
        ctx.fillStyle = 'grey';
      else
        ctx.fillStyle = 'grey';
      ctx.fillRect(x * xM, y * yM, xM, yM);
    } else if(point.isPortal) {
      ctx.fillStyle = 'blue';

      ctx.fillRect(x * xM, y * yM, xM, yM);
    }
  });
}

},{"./js/dim2":1,"./js/graph":2}]},{},[3]);
