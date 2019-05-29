class Image {
  int x = 0;
  int y = 0;
  int w, h;
  float f = 1;
  PImage img;

  Image () {

  }

  void set(String url){
    img = loadImage(url);
    initialize();
  }

  void display(){
    image(img, x, y, w, h);
    filter(GRAY);
    // fill(255,255,0,20);
    //
    // rect(0,0,width,height);
    // blend(0, 0, width, height, 0, 0, width, height, ADD);
  }

  void initialize(){
    float wfactor = 1;
    float hfactor = 1;

    hfactor = float(width) / float(img.height);
    wfactor = float(height) / float(img.width);
    f = returnBigger(wfactor, hfactor);

    w = int(f * img.width);
    h = int(f * img.height);
    x = int((height - (f * img.width))/2);
    y = int((width - (f * img.height))/2);
  }

  float returnBigger(float a, float b){
    if (a >= b) {
      return a;
    } else {
      return b;
    }
  }
}
