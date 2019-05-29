class Card {
  Image bg;
  int topMargin = 20;
  int leftMargin = 15;
  String h = "Title";
  String p = "Plot.";
  String defaultURL = "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/09/12/11/naturo-monkey-selfie.jpg";


  Card () {
    bg = new Image();
    textAlign(LEFT);
    topMargin = int(width / topMargin);
    leftMargin = int(height / leftMargin);

    //set default Value
    this.set(defaultURL,h,p);
  }

  void display(){
    bg.display();

    fill(255,255,0);
    textFont(sporting);
    textAlign(LEFT, TOP);
    textShadow(h, leftMargin, topMargin, height, width/2);
    // fill(255,0,0);
    // rect(leftMargin, topMargin, height, width/2);

    textLeading(2);
    textFont(inter);
    textAlign(LEFT, BOTTOM);
    textShadow(p, leftMargin, width/2 - topMargin, height*.6, width/2);
    // fill(255,0,0);
    // rect(leftMargin, width/2 - topMargin, height*.6, width/2);
  }

  void set(String imgUrl, String header, String plot){
    bg.set(imgUrl);
    h = header;
    p = plot;
  }

  void textShadow(String text, float x, float y, float w, float h){
    fill(0);
    for (int o = -1; o < 2; o++) {
      text(text, x+o, y, w, h);
      text(text, x, y+o, w, h);
    }
    fill(255,255,0);
    text(text, x, y, w, h);
  }

}
