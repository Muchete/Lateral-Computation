import mqtt.*;
MQTTClient client;
Card card;

PFont sporting, inter;

void setup() {
  // size(1240, 874);
  size(874, 1292);
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

void draw () {
  background(255,255,0);

  translate(width, 0);
  rotate(PI/2);

  card.display();
}

void messageReceived(String topic, byte[] payload) {
  String msg = new String(payload);

  String[] info = split(msg, '|');
  card.set(info[0],info[1],info[2]);
}

void keyPressed(){
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
