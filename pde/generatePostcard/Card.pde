class Card {
  // PShader blur;
  Image bg;
  boolean ready = false;
  int topMargin = 20;
  int leftMargin = 15;
  String h = "Lateral Computation";
  String p = "Plot.";
  String defaultURL = "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/09/12/11/naturo-monkey-selfie.jpg";


  Card () {
    bg = new Image();
    // blur = loadShader("blur.glsl");
    textAlign(LEFT);
    topMargin = int(width / topMargin);
    leftMargin = int(height / leftMargin);

    //set default Value
    set(defaultURL,h,p);
    ready = false;
  }

  void display(){
    bg.display();
    image(blurBG,0,0,height, width);


    fill(255,255,0);
    textFont(sporting);
    textAlign(LEFT, TOP);
    text(h, leftMargin, topMargin, height, width/2);

    // TEST RED RECTANGLE -----------
    // fill(255,0,0);
    // rect(leftMargin, topMargin, height, width/2);

    textLeading(2);
    textFont(inter);
    textAlign(LEFT, BOTTOM);


    fill(255,0,0);
    text(p, leftMargin, width/2 - topMargin, height*.6, width/2);


    // TEST RED RECTANGLE -----------
    // fill(255,0,0);
    // rect(leftMargin, width/2 - topMargin, height*.6, width/2);

  }

  void set(String imgUrl, String header, String plot){
    bg.set(imgUrl);
    h = header;
    p = plot;
    ready = true;

    // blurBG.beginDraw();
    // blurBG.background(255,0,0);
    // drawBlurBG(h, leftMargin, topMargin, height, width/2);
    // drawBlurBG(p, leftMargin, width/2 - topMargin, height*.6, width/2);
    // // blurBG.filter(BLUR, 6);
    // blurBG.endDraw();
  }

  void textShadow(String text, float x, float y, float w, float h){
    // fill(0);
    // for (int o = -1; o < 2; o++) {
    //   text(text, x+o, y, w, h);
    //   text(text, x, y+o, w, h);
    // }
    fill(255,255,0);
    text(text, x, y, w, h);
  }

  void drawBlurBG(String text, float x, float y, float w, float h){
    blurBG.fill(255,0,0);
    blurBG.fill(0);
    for (int o = -1; o < 2; o++) {
      blurBG.text(text, x+o, y, w, h);
      blurBG.text(text, x, y+o, w, h);
    }
  }
}
