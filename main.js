var URL='https://fbcdn-sphotos-a.akamaihd.net/hphotos-ak-ash3/s720x720/527073_472781902738329_1982279571_n.jpg';
var image = new Image();
image.src = URL;
image.onload = imageLoaded

var map = document.getElementById('map');

var container = document.getElementById('container');

var pContainer = document.getElementById('piecesContainer')

var mapContainerHeightRatio = 1.8,mapContainerWidthRatio = 1.2;

var entireHeight,entireWidth,pieceHeight,pieceWidth;

var distribute={
  t:0,
  l:0,
  h:0,
  w:0,
};

var mouseRange={
  t:0,
  l:0,
  h:0,
  w:0,
};

var ROWS = 3,COLS = 3;

var pieces = [],inmap = [];

function imageLoaded(){
  entireHeight=image.height;
  entireWidth=image.width;
  pieceHeight=entireHeight/ROWS;
  pieceWidth=entireWidth/COLS;
  container.style.height = entireHeight*mapContainerHeightRatio + 'px';
  container.style.width = entireWidth*mapContainerWidthRatio + 'px';
  map.style.height = entireHeight + 'px';
  map.style.width = entireWidth + 'px';
  map.style.left = (mapContainerWidthRatio-1)*entireWidth/2 + 'px';
  map.textContent ='';
  distribute.t = entireHeight;
  distribute.l = 0;
  distribute.w = entireWidth*mapContainerWidthRatio-pieceWidth;
  distribute.h = (mapContainerHeightRatio-1)*entireHeight - pieceHeight;
  mouseRange.t = container.offsetTop;
  mouseRange.l = container.offsetLeft;
  mouseRange.w = container.offsetWidth;
  mouseRange.h = container.offsetHeight;
  generatePieces();
  randomisePieces();
}

function generatePieces(){
  if(pieces.length!==0){
    pContainer.innerHTML ='';
  }

  for(var i=0;i<ROWS;i++){
    for(var j=0;j<COLS;j++){
      pieces[i*ROWS+j] = newPiece(i,j)
    }
  }
}

function newPiece(r,c){
  var piece = document.createElement('div');
  if(r === (ROWS-1)){
    piece.style.height = entireHeight-(r)*pieceHeight + 'px';
  }else{
    piece.style.height = pieceHeight + 'px';
  }
  if(c === (COLS-1)){ 
    piece.style.width = entireWidth-(c)*pieceWidth + 'px';
  }else{
    piece.style.width = pieceWidth + 'px';
  }
  piece.style.position = 'absolute';
  piece.style.overflow = 'hidden';
  piece.innerHTML = '<img src="' + URL + '">';
  var img = piece.firstChild;
  img.style.position = 'relative'
  img.style.top = (-r)*pieceHeight+'px';
  img.style.left = (-c)*pieceWidth+'px';
  pContainer.appendChild(piece);
  return {
    elm:piece,
    seq:r*ROWS+c,
    oX:null,
    oY:null
  };
}

function randomisePieces(){
  randomiseArray(pieces);
  var i;
  for(i = 0; i < pieces.length; i++){
    pieces[i].elm.style.left = distribute.l + distribute.w * Math.random() + 'px';
    pieces[i].elm.style.top = distribute.t + distribute.h * Math.random() + 'px';
  }
}

// Read tin - an algorithm I nicked off the net so don't come
// whining to me about readability
function randomiseArray(a){
  for(var x, j, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
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
  if(carriedPiece){
    var mouseX = e.pageX - mouseRange.l,mouseY = e.pageY - mouseRange.t;
    if(mouseX>=0&&mouseX<=mouseRange.w&&mouseY>=0&&mouseY<=mouseRange.h)
    {
      carriedPiece.elm.style.left = mouseX;
      carriedPiece.elm.style.top = mouseY;
    }
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
