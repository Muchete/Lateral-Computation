let debug = true;
let exhibition = true;

const searchUrl =
  "https://en.wikipedia.org/w/api.php?action=query&origin=*&list=search&utf8=&format=json&srlimit=500&srsearch=";
const parseUrl =
  "https://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&prop=text&page=";
// let contentUrl =
//   "https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=revisions&rvprop=content&format=json&titles=";

const roundSvg = document.querySelector("#round-svg");
const header = document.querySelector("#title");
const link = document.querySelector("#link");
const resultDiv = document.querySelector("#resultDiv");
const userInput = document.querySelector("#userinput");

let term;
let title;
let ready = true;
let maxAccuracy = 0.8;
let minAccuracy = 0.65;

//line stuff
let lineList = [];
let curLinePos = 0;

// ----------------------------------------------------------------------------
// GENERAL FUNCTIONS ----------------------------------------------------------
// ----------------------------------------------------------------------------

function findSentenceWith(text, word) {
  // let regex = new RegExp("[^.?!]*(?<=[.?\\s!])" + word + "(?=[\\s.?!])[^.?!]*[.?!]", "gi");
  let regex = new RegExp(
    "(?![{}])[^.?!]*(?<=[.?\\s!])" + word + "(?=[\\s.?!])[^.?!]*[.?!]",
    "gi"
  );
  return text.match(regex);
}

function parsedTime() {
  let d = new Date();
  return (
    d.getDate() +
    "." +
    (d.getMonth() + 1) +
    "." +
    d.getFullYear() +
    " " +
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2)
  );
}

function random(min, max) {
  return Math.random() * (+max - +min) + +min;
}

function writeStatistics(txt) {
  let string = "";

  for (var i = 0; i < txt.length; i++) {
    string += txt[i];
    string += ",";
  }

  // remove ; and add \n
  string = string.substring(string.length - 1, 0);
  string += "\n";

  if (debug || exhibition) {
    console.log(string);
  } else {
    var data = new FormData();
    data.append("data", txt);
    var xhr = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new activeXObject("Microsoft.XMLHTTP");
    xhr.open(
      "post",
      "http://michaelschoenenberger.ch/wiki-api-v1/receiver.php",
      true
    );
    xhr.send(data);
  }
}

// ----------------------------------------------------------------------------
// SEARCH FUNCTIONS -----------------------------------------------------------
// ----------------------------------------------------------------------------

$("#userinput").keypress(function(event) {
  var keycode = event.keyCode ? event.keyCode : event.which;
  if (keycode == "13") {
    searchTriggered();
  }
});

$("#search-button").click(searchTriggered);

function searchTriggered() {
  if (ready) {
    term = userInput.value;
    if (term) {
      emptyLines();
      prepareSearch(term);
    }
  } else {
    alert("Please wait! The algorithm is working.");
  }
}

function prepareSearch(term) {
  ready = false;
  header.innerText = "Please Wait";
  resultDiv.innerText = "";
  search(term);
}

function search(term) {
  let url = searchUrl + term;
  console.log("looking for " + url);

  $.getJSON(url, receivedSearch);
}

function receivedSearch(data) {
  if (data.query.search.length) {
    let index =
      data.query.search.length -
      Math.floor(random(minAccuracy, maxAccuracy) * data.query.search.length);

    title = data.query.search[index].title;

    // set fixed title for a specific article.
    // title = "Jōetsu Line";
    // title = "Pulau Biola";
    // title = "Titanic";

    header.innerText = title;
    console.log("Loaded Article " + index + " of " + data.query.search.length);
    title = title.replace(/\s+/g, "_");
    link.href = "https://en.wikipedia.org/wiki/" + title;

    console.log("Querying: " + title);
    let url = parseUrl + title;

    $.getJSON(url, gotParsed);
  } else {
    console.log("no results");
    header.innerText = "No results. Sorry!";
    link.href = "#";
    ready = true;
  }
}

function loadContent(title) {
  header.innerText = title;
  // console.log("Loaded Article " + index + " of " + data.query.search.length);
  title = title.replace(/\s+/g, "_");
  link.href = "https://en.wikipedia.org/wiki/" + title;

  console.log("Querying: " + title);
  let url = parseUrl + title;

  $.getJSON(url, gotParsed);
}

function noResults() {
  console.log("no results");
  header.innerText = "No results. Sorry!";
  link.href = "#";
  ready = true;
}

// ----------------------------------------------------------------------------
// RECEIVED DATA FUNCTIONS ----------------------------------------------------
// ----------------------------------------------------------------------------

function gotParsed(data) {
  let txt = data.parse.text["*"];
  // console.log(txt);

  $("#resultDiv")
    .html(txt)
    .promise()
    .done(applyStyle);
}

function applyStyle() {
  //fix wiki links
  $(this)
    .find("a")
    .each(function(index, el) {
      let a_link = $(this).attr("href");
      if (a_link) {
        //"stay on site" code
        if (a_link.substring(0, 5) == "/wiki") {
          $(this).attr("href", "#");
          $(this).click(function(event) {
            if ($(this).attr("title")) {
              header.innerText = $(this).attr("title");
              $("#resultDiv").empty();
              emptyLines();
              let x = $(this)
                .attr("title")
                .replace(/\s+/g, "_");
              link.href = "https://en.wikipedia.org/wiki/" + x;
              let url = parseUrl + x;

              $.getJSON(url, gotParsed);
            }
          });
        }
      }
    });

  //remove all style html elements
  $(this)
    .find("style")
    .add(".mw-empty-elt")
    .remove();

  //loop each element
  $(this)
    .find("*")
    .each(function(index, el) {
      if ($(this).css("display") == "none") {
        //delete if invisible
        $(this).remove();
      }

      //delete bg color attribute and other styles
      $(this).removeAttr("bgcolor");
      $(this).removeAttr("style");
    });

  //
  $(this)
    .find("img")
    .removeAttr("width")
    .removeAttr("height");

  // mark terms in resultDiv (this) and title
  $(this)
    .add("#title")
    .mark(term, {
      element: "span",
      className: "term"
    });

  //add left lane div
  $(this).prepend('<div class="left-lane"></div>');

  //add content to left div
  $(this)
    .find(".infobox")
    .add(".toc")
    .add(".tright")
    // .add(".thumb") // images in left lane?
    .add(".vertical-navbox")
    .appendTo(".left-lane");

  //mark first p (mostly short description)
  $(".mw-parser-output > p:first").addClass("first-p");

  $("img").on("load", createLines);
  createLines();

  ready = true;
}

// ----------------------------------------------------------------------------
// LINE FUNCTIONS -------------------------------------------------------------
// ----------------------------------------------------------------------------

window.onresize = function(event) {
  createLines();
};

function emptyLines() {
  $("#svgContainer svg").empty();
}

function createLines() {
  lineList = [];

  let t = $("input.search");
  let parent = $("#moving-frame");
  let x = t.offset().left - parent.offset().left + t.width() / 2;
  let y = t.position().top - parent.offset().top + t.height() / 2;
  lineList.push([x, y]);

  $("span.term").each(function(index, el) {
    t = $(this);
    x = t.offset().left - parent.offset().left + t.width() / 2;
    y = t.offset().top - parent.offset().top + t.height() / 2;

    lineList.push([x, y]);
  });

  roundSvg.innerHTML = svgPath(lineList);
}

// ----------------------------------------------------------------------------
// SHIFTR FUNCTIONS -----------------------------------------------------------
// ----------------------------------------------------------------------------

//setting up shiftr
var client = mqtt.connect(
  "mqtt://lc-receiver:eb7aab538c41e201@broker.shiftr.io",
  {
    clientId: "lc-receiver"
  }
);

client.on("connect", function() {
  console.log("SHIFTR: client has connected!");
});

client.subscribe("/reset");
client.subscribe("/senderQuery");
client.subscribe("/senderQueryFailure");

client.on("message", function(topic, message) {
  console.log("SHIFTR: new message:", topic, message.toString());
  emptyLines();

  if (topic == "/senderQuery") {
    resultDiv.innerText = "";
    s = message.toString().split(">>");
    term = s[0];
    userInput.value = term;
    setSearchWidth();

    header.innerText = "Please Wait";
    loadContent(s[1]);
  } else if (topic == "/senderQueryFailure") {
    resultDiv.innerText = "";
    let errorCode = parseInt(message.toString());
    if (errorCode == 1) {
      console.log("NO RESULTS");
      noResults();
    }
  } else if (topic == "/reset") {
    resultDiv.innerText = "";
    userInput.value = "";
    header.innerText = "Connected.";
    emptyLines();
  }
});

let scrollLoop;
let down = true;
function pageScroll() {
  if (down) {
    window.scrollBy(0, 1);
    if (
      document.querySelector("body").offsetHeight - scrollY ==
      window.innerHeight
    ) {
      toggleDirection();
    }
  } else {
    window.scrollBy(0, -1);
    if (scrollY == 0) {
      toggleDirection();
    }
  }

  // scrollLoop = setTimeout(pageScroll, speed);
}

function toggleDirection() {
  down = !down;
}

// pageScroll(10000, 500);
scrollLoop = setInterval(pageScroll, 50);
