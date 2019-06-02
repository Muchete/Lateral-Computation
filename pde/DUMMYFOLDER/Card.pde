class Card {
  // PShader blur;
  Image bg;
  boolean ready = false;
  int topMargin = 20;
  int leftMargin = 15;

  int pSize = 18;
  int pLeading = 24;

  int hSize = 44;
  int hLeading = 51;

  float pBoxW;

  int marginL = 4;
  //padding in relation to font size
  float paddingB = .5;


  String h = "Lateral Computation";
  String p = "The presence of computer networks and the associated algorithms rises daily. Filter systems on the internet offer less and less room for unexpected, yet refreshing, encounters. Lateral Computation explores the potential of enforcing serendipity in knowledge retrieval systems by making use of alternative algorithms.";
  String defaultURL = "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/09/12/11/naturo-monkey-selfie.jpg";


  Card () {
    bg = new Image();
    // blur = loadShader("blur.glsl");
    topMargin = int(width / topMargin);
    leftMargin = int(height / leftMargin);
    pBoxW = height*.6;

    //set default Value
    set(defaultURL,h,p);
    ready = false;

    // p = "Shanghai (Chinese: 上海, Mandarin pronunciation: [ʂâŋ.xài] (About this soundlisten); Shanghainese pronunciation: [zɑ̃.hɛ] (About this soundlisten)) is one of the four municipalities under the direct administration of the central government of the People's Republic of China, the largest city in China by population, and the largest city proper in the world, with a population of 26.3 million as of 2019.[13][14] It is a global financial center[15] and transport hub, with the world's busiest container port.[16] Located in the Yangtze River Delta, it sits on the south edge of the estuary of the Yangtze in the middle portion of the Eastern China coast. The municipality borders the provinces of Jiangsu and Zhejiang to the south, east and west, and is bound to the east by the East China Sea.[17]";
  }

  void display(){
    bg.display();
    // image(blurBG,0,0);

    headerBLK(h, leftMargin, topMargin, height, width/2);

    // TEST RED RECTANGLE -----------
    // fill(255,0,0);
    // rect(leftMargin, topMargin, height, width/2);

    textBLK(p, leftMargin, width/2 - topMargin, pBoxW, width/2);

    // TEST RED RECTANGLE -----------
    // fill(255,0,0);
    // rect(leftMargin, width/2 - topMargin, height*.6, width/2);

  }

  void set(String imgUrl, String header, String plot){
    bg.set(imgUrl);
    h = header;
    p = plot;
    ready = true;

  }

  void headerBLK(String text, float x, float y, float w, float h){
    textFont(sporting);
    textSize(hSize);
    textLeading(hLeading);
    textAlign(LEFT, TOP);
    float offsetY = textDescent()*paddingB;

    String[] paras = toParagraph(text, w);

    for (int i = 0; i < paras.length ; i++) {
      float newY = y + (hLeading * abs(i-paras.length+1));
      fill(0);
      rect(x - marginL, newY, textWidth(paras[i]), hLeading + offsetY);
    }
    for (int i = 0; i < paras.length ; i++) {
      float newY = y + (hLeading * abs(i-paras.length+1));
      fill(255,255,0);
      text(paras[i], x, newY);
    }
  }

  void textBLK(String text, float x, float y, float w, float h){
    textFont(inter);
    textSize(pSize);
    textLeading(pLeading);
    textAlign(LEFT, BOTTOM);
    float offsetY = textDescent()*paddingB;

    String[] paras = toParagraph(text, w);

    for (int i = 0; i < paras.length ; i++) {
      float newY = y + h - (pLeading * abs(i-paras.length+1));
      fill(0);
      rect(x - marginL, newY - pLeading + offsetY, textWidth(paras[i]), pLeading);
    }
    for (int i = 0; i < paras.length ; i++) {
      float newY = y + h - (pLeading * abs(i-paras.length+1));
      fill(255,255,0);
      text(paras[i], x, newY);
    }

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

  String[] toParagraph(String t, float boxW){
    String[] paragraph = {};
    String tempString = "";
    int startPos = 0;
    int spacePos = 0;
    int paragraphSize = 775;

    for (int pos = 0; pos < t.length(); pos++) {
      if (t.charAt(pos) == ' ' || t.charAt(pos) == '\n'){
        spacePos = pos+1;
      }
      tempString += t.charAt(pos);

      if (textWidth(tempString) > boxW || t.charAt(pos) == '\n'){
        paragraph = append(paragraph, t.substring(startPos, spacePos));
        pos = spacePos;
        startPos = spacePos;
        tempString = "";
      }
    }
    paragraph = append(paragraph, t.substring(startPos, t.length()) + " ");
    return paragraph;
  }
}
