
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
