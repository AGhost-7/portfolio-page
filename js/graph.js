
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
