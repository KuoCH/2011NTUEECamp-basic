var   image = new Image(),
div = document.getElementById("puzzle"),
container = document.getElementById("container"),
statusP,
scale = 80,
border = 10,
trayDepth = 100,
invScale = 1.0 / scale,
ROWS = 3,
COLS = 3,
tiles = [],
slots = [],
SPRITE_SHEET = "url('"+URL+"')",
mouseX,
mouseY,
offsetX,
offsetY,
carriedTile,
maskRect;

/* Sprite
*
* A css Sprite:
* sheet is the sprite-sheet which this object will be using to render the
* sprite. So sheetX and sheetY is the top left hand corner of the area we're
* grabbing. dx and dy are used optionally to place the sprite off-center
*/
function Sprite(x, y, sheet, sheetX, sheetY, width, height, dx, dy, maskRect){
  this.x = x;
  this.y = y;
  this.sheetX = sheetX;
  this.sheetY = sheetY;
  this.width = width;
  this.height = height;
  this.dx = dx || 0;
  this.dy = dy || 0;
  this.div = document.createElement("div");
  this.div.style.backgroundImage = sheet;
  this.div.style.backgroundPosition = (-sheetX) + "px " + (-sheetY) + "px";
  this.div.style.position = "absolute";
  this.div.style.width = width;
  this.div.style.height = height;
  this.maskRect = maskRect;
}
Sprite.prototype = {
  // updates the sprite position
  update: function(x, y){
    x = x ? parseInt(x) : this.x;
    y = y ? parseInt(y) : this.y;
    var posX = this.dx + x;
    var posY = this.dy + y;
    if(maskRect){

      // if inside the masking area - business as usual
      if(posX >= maskRect.x && posY >= maskRect.y && posX + this.width < maskRect.x + maskRect.width && posY + this.height < maskRect.x + maskRect.height){
        this.div.style.backgroundPosition = (-this.sheetX) + "px " + (-this.sheetY) + "px";
        this.div.style.width = this.width;
        this.div.style.height = this.height;

        // else clip the width and move the sheet reference to mask the
        // sprite with in the rectangle maskRect
      } else {
        this.div.style.width = Math.abs(Math.max(maskRect.x, posX) - Math.min(maskRect.x + maskRect.width, posX + this.width));
        this.div.style.height = Math.abs(Math.max(maskRect.y, posY) - Math.min(maskRect.y + maskRect.height, posY + this.height));
        var sheetPosX = -this.sheetX + (posX < maskRect.x ? posX - maskRect.x : 0);
        var sheetPosY = -this.sheetY + (posY < maskRect.y ? posY - maskRect.y: 0);
        this.div.style.backgroundPosition = sheetPosX + "px " + sheetPosY + "px";
        if(posX < maskRect.x) posX = maskRect.x;
        if(posY < maskRect.y) posY = maskRect.y;
      }
    }
    this.div.style.left = offsetX + posX;
    this.div.style.top = offsetY + posY;
  }
}
// calculates offset (needed to render relative to an element)
function getOffset(element){
  offsetX = offsetY = 0;
  if(element.offsetParent){
    do{
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }
}
/* Tile
*
* A tile in a sliding tile puzzle
*/
Tile.prototype = new Sprite();
Tile.prototype.constructor = Tile;
Tile.prototype.parent = Sprite.prototype;
function Tile(r, c, sheet, maskRect){
  // Sprite(c * scale, r * scale, sheet, c * scale, r * scale, scale, scale, 0, 0, maskRect);
  Sprite.call(this, c * scale, r * scale, sheet, c * scale, r * scale, scale, scale, 0, 0, maskRect);
  this.pX = this.x;
  this.pY = this.y;
  this.r = r;
  this.c = c;
}
Tile.prototype.copy = function(){
  var tile = new Tile(this.r, this.c, this.div.style.backgroundImage, this.maskRect);
  tile.x = this.x;
  tile.y = this.y;
  tile.slideX = this.slideX;
  tile.slideY = this.slideY;
  return tile;
}

// mouse listeners
function mouseDown(e){
  var mx = mouseX - offsetX;
  var my = mouseY - offsetY;
  if(!carriedTile){
    // check for tile pick up,
    // we work backwards to pick the tile on top
    var i, tile;
    for(i = tiles.length - 1; i > -1; i--){
      tile = tiles[i];
      if(mx >= tile.x && my >= tile.y && mx < tile.x + tile.width && my < tile.y + tile.height){
        // get the carriedTile to the top of the stack
        carriedTile = tile;
        tile.pX = tile.x;
        tile.pY = tile.y;
        tiles.splice(i, 1);
        tiles.push(tile);
        container.appendChild(tile.div);
        // check if we are lifting a tile out of a slot
        if(mx >= 0 && my >= 0 && mx < COLS * scale && my < ROWS * scale){
          var slotX = (mx * invScale) >> 0;
          var slotY = (my * invScale) >> 0;
          if(slots[slotY][slotX] == tile){
            slots[slotY][slotX] = undefined;
          }
        }
        tile.x = -scale * 0.5 + mx;
        tile.y = -scale * 0.5 + my;
        tile.update();
        break;
      }
    }
  }
}
function mouseMove(e){
  mouseX = 0;
  mouseY = 0;
  e = e || window.event;
  if(e.pageX || e.pageY){
    mouseX = e.pageX;
    mouseY = e.pageY;
  } else if (e.clientX || e.clientY){
    mouseX = e.clientX + document.body.scrollLeft
    + document.documentElement.scrollLeft;
    mouseY = e.clientY + document.body.scrollTop
    + document.documentElement.scrollTop;
  }
  // update the carriedTile if it exists
  if(carriedTile){
    carriedTile.x = -scale * 0.5 + mouseX - offsetX;
    carriedTile.y = -scale * 0.5 + mouseY - offsetY;
    carriedTile.update();
  }

}
function mouseUp(e){
  var mx = mouseX - offsetX;
  var my = mouseY - offsetY;

  if(mx >= 0 && my >= 0 && mx < COLS * scale && my < ROWS * scale){
    // see if we can drop the tile on the board, otherwise
    // drop it where it was picked up
    var slotX = (mx * invScale) >> 0;
    var slotY = (my * invScale) >> 0;
    if(!slots[slotY][slotX]){
      slots[slotY][slotX] = carriedTile;
      carriedTile.x = slotX * scale;
      carriedTile.y = slotY * scale;
    } else {
      carriedTile.x = carriedTile.pX;
      carriedTile.y = carriedTile.pY;
      // the tile may have been in a slot previously, we can
      // verify this by checking if it was above the tray
      if(carriedTile.y < ROWS * scale){
        slotX = (carriedTile.x * invScale) >> 0;
        slotY = (carriedTile.y * invScale) >> 0;
        slots[slotY][slotX] = carriedTile;
      }
    }
  } else {
    // drop it in the tray
    carriedTile.y = Math.max(carriedTile.y, ROWS * scale);
  }
  carriedTile.update();
  carriedTile = undefined;
  var c = complete();
  if(c == ROWS * COLS){
    //statusP.innerHTML = "Great Success!";
    alert('yahoo');
  } else {
    var p = ((100 / (ROWS * COLS)) * c) >> 0;
    statusP.innerHTML = p + "% Complete";
  }
}

// Called to prep the tiles
function initTiles(){
  getOffset(div);
  var r, c, tile;
  maskRect = {x:-border, y:-border, width:border * 2 + COLS * scale, height:trayDepth + border * 2 + ROWS * scale}
  for(r = 0; r < ROWS; r++){
    slots[r] = [];
    for(c = 0; c < COLS; c++){
      slots[r][c] = undefined;
      tile = new Tile(r, c, SPRITE_SHEET, maskRect);
      tile.update();
      div.appendChild(tile.div);
      tiles.push(tile);
    }
  }
  randomiseTiles();
}

// Returns the number of tiles that are in their home position
function complete(){
  var r, c;
  var total = 0;
  for(r = 0; r < ROWS; r++){
    for(c = 0; c < COLS; c++){
      if(slots[r][c] && slots[r][c].r == r && slots[r][c].c == c) total++;
    }
  }
  return total
}

// Randomises the tile positions
//
function randomiseTiles(){
  randomiseArray(tiles);
  var i;
  for(i = 0; i < tiles.length; i++){
    tiles[i].x = -border + Math.random() * (maskRect.width - scale);
    tiles[i].y = ROWS * scale + Math.random() * (trayDepth - scale);
    div.appendChild(tiles[i].div);
    tiles[i].update();
  }
}

// Read tin - an algorithm I nicked off the net so don't come
// whining to me about readability
function randomiseArray(a){
  for(var x, j, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
}

// Initialisation from this point in
function init(){
  div.innerHTML = "";
  div.style.width = COLS * scale;
  div.style.height = ROWS * scale;
  container.style.paddingLeft = border;
  container.style.paddingTop = border;
  container.style.width = border + COLS * scale;
  container.style.height = trayDepth + border + ROWS * scale;
  initTiles();
  container.addEventListener("mousedown", mouseDown, false);
  container.addEventListener("mouseup", mouseUp, false);
  container.addEventListener("mousemove", mouseMove, false);
  statusP = document.getElementById("heyyo");
  container.parentNode.appendChild(statusP);
  var p = ((100 / (ROWS * COLS)) * complete()) >> 0;
  statusP.innerHTML = p + "% Complete";
}

function resetImage(){
  image.onload = reinit;
  SPRITE_SHEET = "url('"+URL+"')",
  image.src = URL;
}

function reinit(){
  div.innerHTML = "";
  div.style.width = COLS * scale;
  div.style.height = ROWS * scale;
  container.style.paddingLeft = border;
  container.style.paddingTop = border;
  container.style.width = border + COLS * scale;
  container.style.height = trayDepth + border + ROWS * scale;
  reinitTiles();
  container.addEventListener("mousedown", mouseDown, false);
  container.addEventListener("mouseup", mouseUp, false);
  container.addEventListener("mousemove", mouseMove, false);
  statusP = document.getElementById("heyyo");
  container.parentNode.appendChild(statusP);
  var p = ((100 / (ROWS * COLS)) * complete()) >> 0;
  statusP.innerHTML = p + "% Complete";
}
function reinitTiles(){
  getOffset(div);
  var r, c, tile;
  maskRect = {x:-border, y:-border, width:border * 2 + COLS * scale, height:trayDepth + border * 2 + ROWS * scale}
  tiles = [];
  for(r = 0; r < ROWS; r++){
    for(c = 0; c < COLS; c++){
      slots[r][c] = undefined;
      tile = new Tile(r, c, SPRITE_SHEET, maskRect);
      tile.update();
      div.appendChild(tile.div);
      tiles.push(tile);
    }
  }
  randomiseTiles();
}
image.onload = init;
image.src = URL;

