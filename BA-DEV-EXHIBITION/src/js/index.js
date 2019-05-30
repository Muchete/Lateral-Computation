// ----------------------------------------------------------------------------
// PATH FUNCTIONS -------------------------------------------------------------
// ----------------------------------------------------------------------------

// The smoothing ratio
const smoothing = 0.25;

const line = (pointA, pointB) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

const controlPoint = (current, previous, next, reverse) => {
  const p = previous || current;
  const n = next || current;
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};

const bezierCommand = (point, i, a) => {
  const cps = controlPoint(a[i - 1], a[i - 2], point);
  const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
};

const svgPath = points => {
  const d = points.reduce(
    (acc, point, i, a) =>
      i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${bezierCommand(point, i, a)}`,
    ""
  );
  return `<path d="${d}" fill="none" />`;
};

// ----------------------------------------------------------------------------
// RESIZING OF SEARCHBOX ------------------------------------------------------
// ----------------------------------------------------------------------------

$.fn.textWidth = function(text, font) {
  if (!$.fn.textWidth.fakeEl)
    $.fn.textWidth.fakeEl = $("<span>")
      .hide()
      .appendTo(document.body);

  $.fn.textWidth.fakeEl
    .text(
      text ||
        this.val().replace(/[ \t]+$/g, ".") ||
        this.text() ||
        this.attr("placeholder")
    )
    .css("font", font || this.css("font"));

  return $.fn.textWidth.fakeEl.width();
};

$(".width-dynamic")
  .on("input", setSearchField)
  .trigger("input");

function setSearchField() {
  var inputWidth = $(".width-dynamic").textWidth();
  $(".width-dynamic").css({
    width: inputWidth
  });
  console.log(this);
}

$(document).ready(function() {
  setSearchField();
});

function inputWidth(elem, minW, maxW) {
  elem = $(this);
  // console.log(elem)
}

var targetElem = $(".width-dynamic");

inputWidth(targetElem);

// ----------------------------------------------------------------------------
// START MAIN -----------------------------------------------------------------
// ----------------------------------------------------------------------------

let debug = true;

const searchUrl =
  "https://en.wikipedia.org/w/api.php?action=query&origin=*&list=search&utf8=&format=json&srlimit=500&srsearch=";
const parseUrl =
  "https://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&prop=text&page=";

const roundSvg = document.querySelector("#round-svg");
const header = document.querySelector("#title");
const link = document.querySelector("#link");
const resultDiv = document.querySelector("#resultDiv");
const userInput = document.querySelector("#userinput");

let term;
let title;
let cardTitle;
let correctTitle;
let plot;
let ready = true;
let maxAccuracy = 0.8;
let minAccuracy = 0.65;

//line stuff
let lineList = [];
let curLinePos = 0;

window.history.pushState({ home: true }, "");

// ----------------------------------------------------------------------------
// GENERAL FUNCTIONS ----------------------------------------------------------
// ----------------------------------------------------------------------------

$.fn.random = function() {
  return this.eq(Math.floor(Math.random() * this.length));
};

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
      prepareSearch(term);
    }
  } else {
    alert("Please wait! The algorithm is working.");
  }
}

function prepareSearch(term) {
  ready = false;
  header.innerText = "Please Wait";
  hideContent(true);
  emptyLines();
  search(term);
}

function resetSearch() {
  setSearchField();
  emptyLines();
  hideContent();
}

function hideContent(del) {
  $("#resultDiv").fadeOut("fast", function() {
    if (del) {
      $(this).empty();
    }
  });
}

function showContent() {
  $("#resultDiv").fadeIn({
    duration: "slow",
    // queue: false,
    start: function() {
      createLines();
    }
  });
}

function search(term) {
  let url = searchUrl + term;
  // console.log("looking for " + url);
  $.getJSON(url, receivedSearch);
}

function receivedSearch(data) {
  if (data.query.search.length) {
    let index =
      data.query.search.length -
      Math.floor(random(minAccuracy, maxAccuracy) * data.query.search.length);

    title = data.query.search[index].title;
    cardTitle = title;

    correctTitle = data.query.search[0].title;

    // set fixed title for a specific article.
    // title = "Jōetsu Line";
    // title = "Pulau Biola";
    // title = "Titanic";

    header.innerText = title;
    // console.log("Loaded Article " + 0 + " of " + data.query.search.length);
    // console.log(
    //   "Sent Article " +
    //     index +
    //     " of " +
    //     data.query.search.length +
    //     "to the receiver"
    // );
    title = title.replace(/\s+/g, "_");
    link.href = "https://en.wikipedia.org/wiki/" + title;

    // console.log("Querying: " + title);

    setHistory();
    let url = parseUrl + title;
    $.getJSON(url, gotParsed);
  } else {
    // console.log("no results");
    header.innerText = "No results. Sorry!";
    link.href = "#";
    ready = true;
  }
}

// ----------------------------------------------------------------------------
// History functions ----------------------------------------------------------
// ----------------------------------------------------------------------------

window.onpopstate = function(event) {
  hideContent();
  emptyLines();

  if (event.state.home) {
    userInput.value = "";
    header.innerText = "";
    resultDiv.innerText = "This is a serendipitous Knowledge-Retrieval-System.";
  } else {
    userInput.value = event.state.term;
    header.innerText = event.state.cardTitle;
    let url = parseUrl + event.state.title;
    $.getJSON(url, gotParsed);
  }

  setSearchField();
};

function setHistory() {
  let l = {
    title: title,
    cardTitle: cardTitle,
    term: term,
    home: false
  };
  window.history.pushState(l, "");
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
              hideContent();
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

  $("#copyright")
    .clone()
    .removeAttr("style") //REMOVE FOR EXHIBITION
    .appendTo(this);

  //mark first p (mostly short description)
  $(".mw-parser-output > p:first").addClass("first-p");

  createLines();
  $("img").on("load", createLines);
  $("#resultDiv")
    .find("*")
    .on("load", createLines);

  //send card info, once images are Loaded
  let imagesLoaded = 0;
  let totalImages = $(this).find("img").length;
  $("img").on("load", function(event) {
    imagesLoaded++;
    if (imagesLoaded == totalImages) {
      sendCardInfo();
    }
  });

  ready = true;
  showContent();
}

// ----------------------------------------------------------------------------
// SEND CARD INFOS ------------------------------------------------------------
// ----------------------------------------------------------------------------

function sendCardInfo() {
  plot = $(".first-p")
    .remove(".reference")
    .text(); //??? REMOVE REFERENCES IN HERE

  if (plot.endsWith("\n")) {
    plot = plot.substring(0, plot.lastIndexOf("\n"));
  }

  let imgEl;
  let imgURL;

  $("#resultDiv")
    .find("img")
    .each(function(index, el) {
      let tempURL = $(this).attr("src");

      //remove thumbnail from url
      if (tempURL.includes("/thumb")) {
        tempURL = tempURL.replace(/\/thumb/g, "");
        tempURL = tempURL.substring(0, tempURL.lastIndexOf("/"));
      }

      //if not svg
      if (!tempURL.endsWith("svg") && !tempURL.endsWith("webm")) {
        if (imgEl) {
          if ($(this).width() > imgEl.width()) {
            //get widest image
            imgEl = $(this);
          }
        } else {
          imgEl = $(this);
          imgURL = tempURL;
        }
      }
    });

  let h = term.charAt(0).toUpperCase() + term.slice(1);

  if (imgEl) {
    // if not SVG
    //correctTitle would also work
    //cardTitle would also work
    //term would also work
    client.publish("/cardInfo", "https:" + imgURL + "|" + h + "|" + plot);
  }
}

// ----------------------------------------------------------------------------
// LINE FUNCTIONS -------------------------------------------------------------
// ----------------------------------------------------------------------------

window.onresize = function(event) {
  createLines();
  setSearchField();
};

function emptyLines() {
  $("#svgContainer").fadeOut("fast", function() {
    $(this)
      .find("svg")
      .empty();
  });
}

function createLines() {
  lineList = [];

  let t = $("input.search");
  let parent = $("body");
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
  $("#svgContainer").fadeIn("slow");
}

// ----------------------------------------------------------------------------
// SHIFTR FUNCTIONS -----------------------------------------------------------
// ----------------------------------------------------------------------------

//setting up shiftr
var client = mqtt.connect(
  "wss://lc-sender:1c99172350e3efc0@broker.shiftr.io",
  {
    clientId: "lc-card-sender"
  }
);

client.on("connect", function() {
  console.log("SHIFTR: client has connected!");
});
