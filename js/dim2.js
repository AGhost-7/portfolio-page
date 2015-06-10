
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
