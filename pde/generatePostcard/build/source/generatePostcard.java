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
  
  // size(2480, 1748);

  client = new MQTTClient(this);
  client.connect("mqtt://lc-receiver:eb7aab538c41e201@broker.shiftr.io", "processing-receiver");
  client.subscribe("/cardInfo");

  sporting = createFont("SportingGrotesque-Bold", 44);
  inter = createFont("InterUI-Medium", 18);

  card = new Card();
  // card.set("https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Trenes1.jpg/434px-Trenes1.jpg","Title","Plot");

  // noLoop();
}

public void draw () {
  background(255,255,0);
  card.display();

  // exit();
}

public void messageReceived(String topic, byte[] payload) {
  String msg = new String(payload);

  String[] info = split(msg, '|');
  card.set(info[0],info[1],info[2]);
}

public void keyPressed(){
  String fname = card.h + hour() + ":" + minute();
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

  public void display(){
    bg.display();

    fill(255,255,0);
    textFont(sporting);
    textAlign(LEFT, TOP);
    text(h, margin, margin, width, height/2);

    textLeading(2);
    textFont(inter);
    textAlign(LEFT, BOTTOM);
    text(p, margin, height/2 - margin, width*.6f, height/2);
  }

  public void set(String imgUrl, String header, String plot){
    bg.set(imgUrl);
    h = header;
    p = plot;
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

    hfactor = PApplet.parseFloat(height) / PApplet.parseFloat(img.height);
    wfactor = PApplet.parseFloat(width) / PApplet.parseFloat(img.width);
    f = returnBigger(wfactor, hfactor);

    w = PApplet.parseInt(f * img.width);
    h = PApplet.parseInt(f * img.height);
    x = PApplet.parseInt((width - (f * img.width))/2);
    y = PApplet.parseInt((height - (f * img.height))/2);
  }

  public float returnBigger(float a, float b){
    if (a >= b) {
      return a;
    } else {
      return b;
    }
  }
}
  public void settings() {  size(1240, 874); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "generatePostcard" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
