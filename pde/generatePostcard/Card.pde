class Card {
  Image bg;
  int margin = 10;
  String h = "Title";
  String p = "Plot.";
  String defaultURL = "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/09/12/11/naturo-monkey-selfie.jpg";


  Card () {
    bg = new Image();
    textAlign(LEFT);

    //set default Value
    this.set(defaultURL,h,p);
  }

  void display(){
    bg.display();

    fill(255,255,0);
    textFont(sporting);
    textAlign(LEFT, TOP);
    text(h, margin, margin, width, height/2);

    textLeading(2);
    textFont(inter);
    textAlign(LEFT, BOTTOM);
    text(p, margin, height/2 - margin, width*.6, height/2);
  }

  void set(String imgUrl, String header, String plot){
    bg.set(imgUrl);
    h = header;
    p = plot;
  }
}
