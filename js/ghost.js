
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
