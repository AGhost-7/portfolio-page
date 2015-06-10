
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
  direction = { x: 0, y: 0 },
  lastMillis = Date.now(),
  keysPressed = [],
  panel = document.getElementById('panel'),
  map = undefined,
  canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d'),
  closeBtn = document.getElementById('close-btn');

var floor = Math.floor;

closeBtn.onclick = function() {
  document.getElementById('panel').style.visibility = 'hidden';
};

ghost.onload = function() {
  resize();
  initializeMap();
  requestAnimationFrame(updateLoop);
};

window.onkeydown = function(ev){
  var key = ev.which || ev.keyCode,
    index = keysPressed.indexOf(key);

  if(index == -1) {
    keysPressed.push(key);
    direction = getDirection(keysPressed);
  }
};

window.onkeyup = function(ev){
  var key = ev.which || ev.keyCode,
    index = keysPressed.indexOf(key);
  if(index > -1){
    keysPressed.splice(index, 1);
    direction = getDirection(keysPressed);
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
    x: floor(canvas.width / map.length) * startPoint.x,
    y: floor(canvas.height / map[0].length) * startPoint.y
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
  return keysPressed.indexOf(key) > -1;
}

/* Returns the direction the ghost is going based on the keys the user is
 * pressing.
 */
function getDirection(keysPressed){
  var dir = { x: 0, y: 0 };

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

  var tileWidth = floor(canvas.width / map.length);
  var tileHeight = floor(canvas.height / map[0].length);
  var point, x, y;

  for(var i = 0; i < tests.length; i++) {
    x = floor(tests[i].x / tileWidth);
    y = floor(tests[i].y / tileHeight);
    if(map[x] === undefined) return 'dead';
    else {
      point = map[x][y];
      if(point === undefined) return 'dead';
      else if(point.isPortal) return 'won';
      else if(!point.isPath) return 'dead';
    }

  }

  return 'alive';
}

/* Determines the new position based on the keys currently held down.
 * @pointer is the current x/y coordinate of the character.
 * @dir is the x/y positional modifiers based on the keys being held down.
 */
function getGhostPosition(millis, lastMillis, pointer, dir) {
  var millisDiff = floor((millis - lastMillis) / 6);
  return {
    x: pointer.x + (dir.x * millisDiff),
    y: pointer.y + (dir.y * millisDiff)
  };
}

/* The position derived from the fact that the ghost character is floating, and
 * thus goes up and down over time.
 */
function floatOffseted(p, millis) {
  var modulo = floor((millis % 2000) / 80);
  var floatOffset = modulo > 12 ? 12 - (modulo - 12) : modulo;
  return { x: p.x, y: p.y + floatOffset };
}

function updateLoop() {

  //ctx.fillStyle = 'black';
  //ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);


  var millis = Date.now();

  var newP = getGhostPosition(millis, lastMillis, pointer, direction);
  var floatP = floatOffseted(newP, millis);
  var status = getGameStatus(floatP, map);

  if(status == 'won') {
    initializeMap();
    updateLoop();
    return;
  } else if(status == 'dead') {
    throw 'dead...'
  }

  drawMap(ctx, map);

  ctx.drawImage(
      ghost.fromDirection(direction),
      floatP.x,
      floatP.y,
      ghost.width,
      ghost.height
      );

  pointer = newP;
  lastMillis = millis;
  requestAnimationFrame(updateLoop);

}

/* Will draw the game map graph :D
 * TODO: Make this handle uneven height/width better... atm I just need it to
 * draw the paths to see what I'm doing.
 */
function drawMap(ctx, graph){

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // multiplier.
  var xM = floor(ctx.canvas.width / (graph.length)),
    yM = floor(ctx.canvas.height / (graph[0].length));

  dim2.forEach(graph, function(point, x, y) {
    if(point.isPath) {
      if((point.isNode && !point.isConnected))
        ctx.fillStyle = 'red';
      else
        ctx.fillStyle = 'grey';
      //ctx.fillRect(x * xM, y * yM, xM, yM);
    } else if(point.isPortal) {
      ctx.fillStyle = 'blue';

      //ctx.fillRect(x * xM, y * yM, xM, yM);
    } else {
      ctx.fillStyle = 'black';
    }

    ctx.fillRect(x * xM, y * yM, xM, yM);
  });
}
