import mqtt.*;
MQTTClient client;
Card card;

PFont sporting, inter;
PGraphics blurBG;


void setup() {
  // size(1240, 874);
  size(874, 1292);
  // size(2480, 1748);
  // size(1748, 2480);
  smooth();
  frameRate(4);
  blurBG = createGraphics(width, height);

  client = new MQTTClient(this);
  client.connect("mqtt://lc-receiver:eb7aab538c41e201@broker.shiftr.io", "processing-receiver");
  client.subscribe("/cardInfo");

  sporting = createFont("SportingGrotesque-Bold", 44);
  // inter = createFont("InterUI-Medium", 18);
  inter = createFont("Inter-Bold", 18);

  card = new Card();

  noStroke();
}

void draw () {
  background(255);

  translate(width, 0);
  rotate(PI/2);

  card.display();

  if (!card.printed && card.ready){
    printCard();
    card.printed = true;
  }
}

void messageReceived(String topic, byte[] payload) {
  String msg = new String(payload);

  String[] info = split(msg, '|');
  try {
    card.set(info[0],info[1],info[2]);
  } catch (Exception x) {
    println("card couldn't be loaded");
    println("Err: " + x);
  }
}

void printCard(){
  String fname =  str(day()) + str(hour()) + str(minute()) + card.h;
  save("/Applications/MAMP/htdocs/BA-Experiments/pde/generatePostcard/prints/"+fname+".jpg");
}

void keyPressed(){
  String fname =  str(day()) + str(hour()) + str(minute()) + card.h;
  switch (key) {
    case 'p':
      save("/Applications/MAMP/htdocs/BA-Experiments/pde/generatePostcard/prints/"+fname+".jpg");

      break;
    case 's':
      save("/Applications/MAMP/htdocs/BA-Experiments/pde/generatePostcard/exports/"+fname+".jpg");
      break;
  }
}
