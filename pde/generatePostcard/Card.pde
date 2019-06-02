class Card {
  // PShader blur;
  Image bg;
  boolean ready = false;
  int topMargin = 20;
  int leftMargin = 15;
  String h = "Lateral Computation";
  String p = "Plot.";
  int pLeading = 23;
  int pSize = 18;
  int backgroundOffset;
  int lineCount;
  float lastLine;
  float pBoxWidth;
  String defaultURL = "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/09/12/11/naturo-monkey-selfie.jpg";


  Card () {
    bg = new Image();
    // blur = loadShader("blur.glsl");
    topMargin = int(width / topMargin);
    leftMargin = int(height / leftMargin);
    pBoxWidth = height*.6;

    //set default Value
    set(defaultURL,h,p);
    ready = false;
  }

  void display(){
    bg.display();
    image(blurBG,0,0);


    fill(255,255,0);
    textFont(sporting);
    textAlign(LEFT, TOP);
    text(h, leftMargin, topMargin, height, width/2);

    // TEST RED RECTANGLE -----------
    // fill(255,0,0);
    // rect(leftMargin, topMargin, height, width/2);



    // fill(255,255,0);
    // textFont(inter);
    // textSize(pSize);
    // textLeading(pLeading);
    // textAlign(LEFT, BOTTOM);
    pBLK(p, leftMargin, width/2 - topMargin, height*.6, width/2);


    // TEST RED RECTANGLE -----------
    // fill(255,0,0);
    // rect(leftMargin, width/2 - topMargin, height*.6, width/2);

  }

  void set(String imgUrl, String header, String plot){
    bg.set(imgUrl);
    h = header;
    p = plot;


    lineCount = int(1 + floor(textWidth(p) / pBoxWidth));
    println("lines: " + lineCount);
    lastLine = textWidth(p) % pBoxWidth;
    println("last line: " + lastLine);


    // drawBlurBG();
    ready = true;
  }

  void pBLK(String text, float x, float y, float w, float h){
    float yOffset = 3;

    fill(0);
    for (int l = 1; l < lineCount; l++) {
      rect(x, y + h - pLeading - (pLeading * l) + yOffset, pBoxWidth, pSize);
    }
    rect(x, y + h - pLeading + yOffset, pBoxWidth, pSize);

    fill(255,255,0);
    textFont(inter);
    textSize(pSize);
    textLeading(pLeading);
    textAlign(LEFT, BOTTOM);
    text(text, x, y, w, h);
  }

  void textBorder(String text, float x, float y, float w, float h){
    fill(0);
    for (int o = -1; o < 2; o++) {
      text(text, x+o, y, w, h);
      text(text, x, y+o, w, h);
    }
    fill(255,255,0);
    text(text, x, y, w, h);
  }

  void drawBlurBG(){
    blurBG.beginDraw();
    blurBG.clear();

    blurBG.fill(255,255,0);
    blurBG.textFont(sporting);
    blurBG.textAlign(LEFT, TOP);
    drawBlurText(h, leftMargin, topMargin, height, width/2);

    blurBG.textFont(inter);
    blurBG.textSize(pSize);
    blurBG.textLeading(pLeading);
    blurBG.textAlign(LEFT, BOTTOM);
    drawBlurText(p, leftMargin, width/2 - topMargin, height*.6, width/2);

    blurBG.filter(BLUR, 12);
    blurBG.endDraw();
  }

  void drawBlurText(String text, float x, float y, float w, float h){
    blurBG.fill(0,200);
    // for (int o = -1; o < 2; o++) {
    //   blurBG.text(text, x+o, y, w, h);
    //   blurBG.text(text, x, y+o, w, h);
    // }
    blurBG.text(text, x, y, w, h);
  }
}
