import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import mqtt.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class generatePostcard extends PApplet {


MQTTClient client;
Card card;

PFont sporting, inter;

public void setup() {
  // size(1240, 874);
  
  // size(2480, 1748);
  // size(1748, 2480);

  client = new MQTTClient(this);
  client.connect("mqtt://lc-receiver:eb7aab538c41e201@broker.shiftr.io", "processing-receiver");
  client.subscribe("/cardInfo");

  sporting = createFont("SportingGrotesque-Bold", 44);
  // inter = createFont("InterUI-Medium", 18);
  inter = createFont("Inter-Medium", 18);

  card = new Card();
}

public void draw () {
  background(255,255,0);

  translate(width, 0);
  rotate(PI/2);

  card.display();
}

public void messageReceived(String topic, byte[] payload) {
  String msg = new String(payload);

  String[] info = split(msg, '|');
  card.set(info[0],info[1],info[2]);
}

public void keyPressed(){
  String fname = card.h + hour() + minute();
  switch (key) {
    case 'p':
      save("prints/"+fname+".jpg");
      break;
    case 's':
      save("exports/"+fname+".jpg");
      break;
  }
}
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
    topMargin = PApplet.parseInt(width / topMargin);
    leftMargin = PApplet.parseInt(height / leftMargin);

    //set default Value
    this.set(defaultURL,h,p);
  }

  public void display(){
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
    textShadow(p, leftMargin, width/2 - topMargin, height*.6f, width/2);
    // fill(255,0,0);
    // rect(leftMargin, width/2 - topMargin, height*.6, width/2);
  }

  public void set(String imgUrl, String header, String plot){
    bg.set(imgUrl);
    h = header;
    p = plot;
  }

  public void textShadow(String text, float x, float y, float w, float h){
    fill(0);
    for (int o = -1; o < 2; o++) {
      text(text, x+o, y, w, h);
      text(text, x, y+o, w, h);
    }
    fill(255,255,0);
    text(text, x, y, w, h);
  }

}
class Image {
  int x = 0;
  int y = 0;
  int w, h;
  float f = 1;
  PImage img;

  Image () {

  }

  public void set(String url){
    img = loadImage(url);
    initialize();
  }

  public void display(){
    image(img, x, y, w, h);
    filter(GRAY);
    // fill(255,255,0,20);
    //
    // rect(0,0,width,height);
    // blend(0, 0, width, height, 0, 0, width, height, ADD);
  }

  public void initialize(){
    float wfactor = 1;
    float hfactor = 1;

    hfactor = PApplet.parseFloat(width) / PApplet.parseFloat(img.height);
    wfactor = PApplet.parseFloat(height) / PApplet.parseFloat(img.width);
    f = returnBigger(wfactor, hfactor);

    w = PApplet.parseInt(f * img.width);
    h = PApplet.parseInt(f * img.height);
    x = PApplet.parseInt((height - (f * img.width))/2);
    y = PApplet.parseInt((width - (f * img.height))/2);
  }

  public float returnBigger(float a, float b){
    if (a >= b) {
      return a;
    } else {
      return b;
    }
  }
}
  public void settings() {  size(874, 1292); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "--present", "--window-color=#666666", "--hide-stop", "generatePostcard" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
