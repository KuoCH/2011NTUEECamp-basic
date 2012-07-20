var URL='812.jpeg';
var image = new Image();
image.src = URL;
image.onload = imageLoaded
var map = document.getElementById('map');
var container = document.getElementById('container');
var imageUrlInput = document.getElementById('image-url');
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
var carriedPiece=null;
var carriedMouseXOffset=0;
var carriedMouseYOffset=0;
var zCount=20;

function imageLoaded(){
  modifyStatus('圖片載入完成！你有辦法完成這個拼圖嗎？');
  recordImageInfo();
  setContainerSize();
  setMapSize();
  calculateDistributeRegion();
  generatePieces();
  randomizePieces();
}
function win(){
    alert('完成了第九張');
    location.href='index970.html'
}
function recordImageInfo(){
  entireHeight=image.height;
  entireWidth=image.width;
  pieceHeight=Math.floor(entireHeight/ROWS);
  pieceWidth=Math.floor(entireWidth/COLS);
}
function setContainerSize(){
  container.style.height = Math.floor(entireHeight*mapContainerHeightRatio) + 'px';
  container.style.width = Math.floor(entireWidth*mapContainerWidthRatio) + 'px';
}
function setMapSize(){
  map.style.height = entireHeight + 'px';
  map.style.width = entireWidth + 'px';
  mapLeft = Math.floor((mapContainerWidthRatio-1)*entireWidth/2);
  map.style.left = mapLeft + 'px';
}
function calculateDistributeRegion(){
  distribute.t = entireHeight;
  distribute.l = 0;
  distribute.w = Math.floor(entireWidth*mapContainerWidthRatio-pieceWidth);
  distribute.h = Math.floor((mapContainerHeightRatio-1)*entireHeight - pieceHeight);
  mouseRange.t = container.offsetTop;
  mouseRange.l = container.offsetLeft;
  mouseRange.w = container.offsetWidth;
  mouseRange.h = container.offsetHeight;
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
  piece.style.zIndex = zCount++;
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
    oInmap:null,
    oX:null,
    oY:null
  };
}

function randomizePieces(){
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
      var piece,hZi=null,hZ=null;
      for(var i = 0;i<pieces.length;i++){
        piece = pieces[i];
        var iX = mouseX - piece.elm.offsetLeft,iY = mouseY -piece.elm.offsetTop;
        if(iX>=0&&iX<=piece.elm.offsetWidth&&iY>=0&&iY<=piece.elm.offsetHeight){
          if(hZi===null||piece.elm.style.zIndex>hZ){
            hZi=i;
            hZ = piece.elm.style.zIndex;
          }
        }
      }
      if(hZi!==null){
        carriedPiece = pieces[hZi];
        carriedPiece.oX = carriedPiece.elm.offsetLeft;
        carriedPiece.oY = carriedPiece.elm.offsetTop;
        carriedPiece.elm.style.zIndex = zCount++;
        carriedMouseXOffset = mouseX - pieces[hZi].elm.offsetLeft;
        carriedMouseYOffset = mouseY -pieces[hZi].elm.offsetTop;
        for(var i =0;i<(ROWS*COLS);i++){
          if(inmap[i]==carriedPiece.seq) {
            inmap[i] = null;
            carriedPiece.oInmap = i;
            break;
          }
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
          inmap[carriedPiece.oInmap] = carriedPiece.seq;
          carriedPiece.oInmap = null;
        }else{
          carriedPiece.elm.style.left = (c*pieceWidth+mapLeft) + 'px';
          carriedPiece.elm.style.top = r*pieceHeight + 'px';
          carriedPiece.oInmap = null;
          inmap[r*ROWS+c] = carriedPiece.seq;
          updateComplete();
        }
      }else{
        carriedPiece.elm.style.left = picX + 'px';
        carriedPiece.elm.style.top = picY + 'px';
        inmap[carriedPiece.oInmap] = carriedPiece.seq;
      }
    }else{
        carriedPiece.elm.style.left = carriedPiece.oX + 'px';
        carriedPiece.elm.style.top = carriedPiece.oY + 'px';
        inmap[carriedPiece.oInmap] = carriedPiece.seq;
    }
        carriedPiece.oX = null;
        carriedPiece.oY = null;
        carriedPiece = null;
  }
}
function updateComplete(){
  var ifwin = true;
  for(var i =0;i<(ROWS*COLS);i++) { 
    if(inmap[i]!=i) ifwin = false;
  }
  if(ifwin) {
    setTimeout(win,1);
  }
}
function modifyStatus(s){
    document.getElementById('status').innerHTML = s;
}
container.addEventListener('mousedown',mouseDown,false);
container.addEventListener('mousemove',mouseMove,false);
container.addEventListener('mouseup',mouseUp,false);