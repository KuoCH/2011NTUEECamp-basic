function imageLoaded(){  //此處挖空讓小隊員填空
  modifyStatus('圖片載入完成！你有辦法完成這個拼圖嗎？');
  recordImageInfo();            // 記錄Image的資訊
  setContainerSize();           //設定container層的大小位置
  setMapSize();                 //設定map層的大小位置
  calculateDistributeRegion();  //計算碎片打亂位置的範圍
  generatePieces();             //產生各個碎片
  randomizePieces();            //將各個碎片打亂
}
function win(){ //這個方塊可挖空給小隊員填效果
    console.log('YAYA~~~~~');
    modifyStatus( '恭喜恭喜～你完成了！' );
    alert('con');
}
