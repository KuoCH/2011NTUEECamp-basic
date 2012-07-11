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
var mapLeft;

var ROWS = 3,COLS = 3;

var pieces = [],inmap = [];
var carriedPiece=false;
var carriedMouseXOffset=0;
var carriedMouseYOffset=0;

var zCount;

function imageLoaded(){
  entireHeight=image.height;
  entireWidth=image.width;
  pieceHeight=Math.floor(entireHeight/ROWS);
  pieceWidth=Math.floor(entireWidth/COLS);
  container.style.height = Math.floor(entireHeight*mapContainerHeightRatio) + 'px';
  container.style.width = Math.floor(entireWidth*mapContainerWidthRatio) + 'px';
  map.style.height = entireHeight + 'px';
  map.style.width = entireWidth + 'px';
  mapLeft = Math.floor((mapContainerWidthRatio-1)*entireWidth/2);
  map.style.left = mapLeft + 'px';
  map.textContent ='';
  distribute.t = entireHeight;
  distribute.l = 0;
  distribute.w = Math.floor(entireWidth*mapContainerWidthRatio-pieceWidth);
  distribute.h = Math.floor((mapContainerHeightRatio-1)*entireHeight - pieceHeight);
  mouseRange.t = container.offsetTop;
  mouseRange.l = container.offsetLeft;
  mouseRange.w = container.offsetWidth;
  mouseRange.h = container.offsetHeight;
  generatePieces();
  randomisePieces();
  zCount = 20;
}

function generatePieces(){
  if(pieces.length!==0){
    pContainer.innerHTML ='';
  }

  for(var i=0;i<ROWS;i++){
    for(var j=0;j<COLS;j++){
      pieces[i*ROWS+j] = newPiece(i,j);
      inmap[i*ROWS+j] = null;
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
  img.ondragstart = function(){ return false;  }
  pContainer.appendChild(piece);
  return {
    elm:piece,
    seq:r*ROWS+c,
    oX:null,
    oY:null
  };
}

function randomisePieces(){
  var i;
  for(i = 0; i < pieces.length; i++){
    pieces[i].elm.style.left = distribute.l + distribute.w * Math.random() + 'px';
    pieces[i].elm.style.top = distribute.t + distribute.h * Math.random() + 'px';
  }
}

// mouse listeners
function mouseDown(e){
  if(carriedPiece){
    return;
  }
  if(e.pageX&&e.pageY){
    var mouseX = e.pageX - mouseRange.l,mouseY = e.pageY - mouseRange.t;
    if(mouseX>=0&&mouseX<=mouseRange.w&&mouseY>=0&&mouseY<=mouseRange.h){
      var piece;
      for(var i = 0;i<pieces.length;i++){
        piece = pieces[i];
        var iX = mouseX - piece.elm.offsetLeft,iY = mouseY -piece.elm.offsetTop;
        if(iX>=0&&iX<=piece.elm.offsetWidth&&iY>=0&&iY<=piece.elm.offsetHeight){
          carriedPiece = piece;
          carriedPiece.oX = carriedPiece.elm.offsetLeft;
          carriedPiece.oY = carriedPiece.elm.offsetTop;
          carriedPiece.elm.style.zIndex = zCount++;
          carriedMouseXOffset = iX;
          carriedMouseYOffset = iY;
          for(var i =0;i<(ROWS*COLS);i++) if(inmap[i]==carriedPiece.seq) inmap[i] = null;
          break;
        }
      }
    }
  }
}
function mouseMove(e){
  if(carriedPiece&&e.pageX&&e.pageY){
    var mouseX = e.pageX - mouseRange.l,mouseY = e.pageY - mouseRange.t;
    if(mouseX>=0&&mouseX<=mouseRange.w&&mouseY>=0&&mouseY<=mouseRange.h)
    {
      carriedPiece.elm.style.left = mouseX-carriedMouseXOffset + 'px';
      carriedPiece.elm.style.top = mouseY-carriedMouseYOffset + 'px';
    }
  }

}
function mouseUp(e){
  if(carriedPiece&&e.pageX&&e.pageY){
    var mouseX = e.pageX - mouseRange.l,mouseY = e.pageY - mouseRange.t;
    var picX = mouseX - carriedMouseXOffset, picY = mouseY - carriedMouseYOffset;
    if(picX>=0&&picX<=mouseRange.w&&picY>=0&&picY<=mouseRange.h)
    {
      if(picY<distribute.t){ // 判斷是否需要放到map上
        var r,c;
        for(r = 0;r<(ROWS-1);r++) if((r+0.5)*pieceHeight>picY) break;
        for(c=0;c<(COLS-1);c++) if(((c+0.5)*pieceWidth+mapLeft)>picX) break;
        if(inmap[r*ROWS+c]!=null){
          carriedPiece.elm.style.left = carriedPiece.oX + 'px';
          carriedPiece.elm.style.top = carriedPiece.oY + 'px';
        }else{
          carriedPiece.elm.style.left = (c*pieceWidth+mapLeft) + 'px';
          carriedPiece.elm.style.top = r*pieceHeight + 'px';
          inmap[r*ROWS+c] = carriedPiece.seq;
          updateComplete();
        }
      }else{
        carriedPiece.elm.style.left = picX + 'px';
        carriedPiece.elm.style.top = picY + 'px';
      }
    }else{
        carriedPiece.elm.style.left = carriedPiece.oX + 'px';
        carriedPiece.elm.style.top = carriedPiece.oY + 'px';
    }
        carriedPiece.oX = null;
        carriedPiece.oY = null;
        carriedPiece = null;
  }
}
function updateComplete(){
  var win = true;
  for(var i =0;i<(ROWS*COLS);i++) { 
    if(inmap[i]!=i) win = false;
  }
  if(win) {
    console.log('YAYA~~~~~');
    alert('恭喜恭喜！～');
  }
}
container.addEventListener("mousedown",mouseDown,false);
container.addEventListener("mousemove",mouseMove,false);
container.addEventListener("mouseup",mouseUp,false);
