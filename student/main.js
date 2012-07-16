function imageLoaded(){

}
function win(){

}
//modifyStatus(s)
//將傳入的 s 字串，取代 index.html 中 id 為 status 的 <p> 標籤內容。
//
//recordImageInfo()
//記錄圖片的資訊，像是圖片的長跟高，以及切成拼圖碎片的長跟高。
//
//setContainerSize()
//設定 container 這一層的大小，由圖片大小決定，由圖片的長與高乘以一定的比例後得到。
//setMapSize()
//設定 map 這一層的大小，由圖片大小決定。因為是要完成拼圖的位置，所以與圖片大小相同。
//並將它的水平位置移到 container 的正中間。
//
//calculateDistributeRegion()
//計算碎片一開始打亂後能放的位置範圍，網頁上是在 map 下面。
//同時設定滑鼠可作用的範圍（也就是 container 的範圍）。
//
//24generatePieces()
//「碎片產生機」。把每個碎片產生、顯示出來，並照順序放進 pieces 陣列。
//
//randomizePieces()
//利用 calculateDistributeRegion 所算出的亂數範圍值，將 pieces裡的每一個碎片的位置亂擺在範圍內。
