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

// $.fn.textWidth = function(text, font) {
//   if (!$.fn.textWidth.fakeEl)
//     $.fn.textWidth.fakeEl = $("<span>")
//       .hide()
//       .appendTo(document.body);
//
//   $.fn.textWidth.fakeEl
//     .text(
//       text ||
//         this.val().replace(/[ \t]+$/g, ".") ||
//         this.text() ||
//         this.attr("placeholder")
//     )
//     .css("font", font || this.css("font"));
//
//   return $.fn.textWidth.fakeEl.width();
// };
//
// $(".width-dynamic")
//   .on("input", setSearchField)
//   .trigger("input");
//
// function setSearchField() {
//   var inputWidth = $(".width-dynamic").textWidth();
//   $(".width-dynamic").css({
//     width: inputWidth
//   });
// }
//
// $(document).ready(function() {
//   setSearchField();
// });
//
// function inputWidth(elem, minW, maxW) {
//   elem = $(this);
//   // console.log(elem)
// }
//
// var targetElem = $(".width-dynamic");
//
// inputWidth(targetElem);

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

let lastArticles = [new Date("1990"), new Date("1990")];
const articleTime = 3; //in minutes, how old the oldest article should be

let startTime;
let lastCardPrinted = new Date();
const cardPrintInterval = 12; //interval of print jobs in minutes should be set at 20!!!!
const popUpTime = 15000;
let cardTracker;
let manualOverride = false;
let presentationOverride = false;
let presentationOverrideReady = true;

let term;
let backupTerm;
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

function addHistory() {
  lastArticles.unshift(new Date());
  lastArticles.splice(-1, 1);
}

function hasVisitedThree() {
  let now = new Date();
  if (now - lastArticles[lastArticles.length - 1] < articleTime * 60 * 1000) {
    return true;
  } else {
    return false;
  }
}

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

// function timeOnArticle() {
//   if (startTime) {
//     return new Date() - startTime;
//   } else {
//     return 0;
//   }
// }

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
      if (term == "muchete make a card please" || term == "ba print") {
        userInput.value = backupTerm;
        term = backupTerm;
        console.log("manual Print!");
        manualOverride = true;
        postCardJob();
      } else if (term == "final presentation" && presentationOverrideReady) {
        presentationOverride = true;
        presentationOverrideReady = false;
        prepareSearch(term);
      } else {
        prepareSearch(term);
      }
      backupTerm = term;
    }
  } else {
    $("#title")
      .add("#title .term")
      .addClass("warn");
    setTimeout(function() {
      $("#title")
        .add("#title .term")
        .removeClass("warn");
    }, 500);
  }
}

function prepareSearch(term) {
  ready = false;
  // header.innerText = "Please Wait";
  hideHeader();
  hideContent(true);
  emptyLines();

  search(term);
}

function resetSearch() {
  // setSearchField();
  emptyLines();
  hideContent();
}

function hideBoth(del) {
  $("#resultDiv").fadeOut({
    duration: "fast",
    // queue: false,
    start: function() {
      emptyLines();
      $("#title").fadeOut("fast");
    },
    complete: function() {
      if (del) {
        $(this).empty();
      }
    }
  });
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
    duration: "fast",
    // queue: false,
    start: function() {
      createLines();
    }
  });
}

function setHeader(txt, f) {
  header.innerText = txt;
  $("#title").fadeIn("fast", f);
}

function changeHeader(txt, f) {
  $("#title").fadeOut("fast", function() {
    setHeader(txt, f);
  });
}

function hideHeader(f) {
  $("#title").fadeOut("fast", f);
}

function errorHandler(e) {
  setHeader(e);
  link.href = "#";
  ready = true;
}

function search(term) {
  let url = searchUrl + term;

  $.ajax({
    url: url,
    dataType: "json"
  })
    .done(receivedSearch)
    .fail(function() {
      errorHandler("Search Failed. Sorry!");
    });
}

function receivedSearch(data) {
  if (data.query.search.length) {
    let index =
      data.query.search.length -
      Math.floor(random(minAccuracy, maxAccuracy) * data.query.search.length);

    title = data.query.search[index].title;
    correctTitle = data.query.search[0].title;

    // set fixed title for a specific article.
    // title = "Jōetsu Line";
    // title = "Pulau Biola";

    if (presentationOverride) {
      title = "National Thanksgiving Turkey Presentation";
      presentationOverride = false;
    }

    // header.innerText = title;
    // setHeader(title);

    cardTitle = title;

    setHeader(title, function() {
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
      $.ajax({
        url: url,
        dataType: "json"
      })
        .done(gotParsed)
        .fail(function() {
          errorHandler("Couldn't load article. Sorry!");
        });
    });
  } else {
    errorHandler("No results. Sorry!");
  }
}

// ----------------------------------------------------------------------------
// History functions ----------------------------------------------------------
// ----------------------------------------------------------------------------

window.onpopstate = function(event) {
  console.log(event);
  if (event.state) {
    hideContent();
    emptyLines();

    if (event.state.home) {
      // userInput.value = "";
      // header.innerText = "";
      // resultDiv.innerText = "This is a serendipitous Knowledge-Retrieval-System.";
      hideHeader();
    } else {
      userInput.value = event.state.term;
      // header.innerText = event.state.cardTitle;
      changeHeader(event.state.cardTitle, function() {
        let url = parseUrl + event.state.title;
        // $.getJSON(url, gotParsed);
        $.ajax({
          url: url,
          dataType: "json"
        })
          .done(gotParsed)
          .fail(function() {
            errorHandler("Couldn't load article. Sorry!");
          });
      });
    }

    // setSearchField();
  }
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
  try {
    let txt = data.parse.text["*"];
    // console.log(txt);

    $("#resultDiv")
      .html(txt)
      .promise()
      .done(applyStyle);
  } catch (e) {
    errorHandler("Couldn't load article. Sorry!");
  }
}

function applyStyle() {
  // startTime = new Date();

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
              let t = $(this).attr("title");
              $("#title").fadeOut({
                duration: "fast",
                start: function() {
                  hideContent();
                  emptyLines();
                },
                complete: function() {
                  header.innerText = t;
                  $("#title").fadeIn({
                    complete: function() {
                      let x = t.replace(/\s+/g, "_");
                      link.href = "https://en.wikipedia.org/wiki/" + x;
                      let url = parseUrl + x;
                      // $.getJSON(url, gotParsed);
                      $.ajax({
                        url: url,
                        dataType: "json"
                      })
                        .done(gotParsed)
                        .fail(function() {
                          errorHandler("Couldn't load article. Sorry!");
                        });
                    }
                  });
                }
              });
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

  ready = true;
  addHistory();
  showContent();

  //send card info, once images are Loaded
  let totalImages = $(this).find("img").length;
  if (totalImages) {
    let imagesLoaded = 0;
    $("img").on("load", function(event) {
      imagesLoaded++;
      if (imagesLoaded == totalImages) {
        postCardJob();
      }
    });
  }
}

// ----------------------------------------------------------------------------
// SEND CARD INFOS ------------------------------------------------------------
// ----------------------------------------------------------------------------

function postCardJob() {
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

      // if it is an image
      if (tempURL.match(/.(jpg|jpeg|png|gif)$/i)) {
        if (imgEl) {
          if ($(this).width() > imgEl.width()) {
            //get widest image
            imgEl = $(this);
            imgURL = tempURL;
          }
        } else {
          imgEl = $(this);
          imgURL = tempURL;
        }
      }
    });

  if (imgEl) {
    plot = $(".first-p")
      .remove(".reference")
      .text(); //??? REMOVE REFERENCES IN HERE

    if (plot.endsWith("\n")) {
      plot = plot.substring(0, plot.lastIndexOf("\n"));
    }

    let h = term.charAt(0).toUpperCase() + term.slice(1);

    // clearInterval(cardTracker);
    // cardTracker = setInterval(function() {
    //   console.log(timeOnArticle());
    // }, 1000);

    if (printAllowance()) {
      setTimeout(function() {
        sendCard(imgURL, h, plot);
      }, 100);
    }
  }
}

function printAllowance() {
  let now = new Date();
  if (
    now - lastCardPrinted > cardPrintInterval * 60 * 1000 &&
    hasVisitedThree()
  ) {
    console.log("card '" + term + "' is being printed now: " + now);
    lastCardPrinted = now;
    return true;
  } else if (manualOverride) {
    manualOverride = false;
    return true;
  } else {
    return false;
  }
}

function sendCard(image, header, plot) {
  $("#cardAlert").fadeIn({
    duration: "fast",
    start: function() {
      client.publish("/cardInfo", "https:" + image + "|" + header + "|" + plot);
    },
    complete: function() {
      setTimeout(function() {
        $("#cardAlert").fadeOut("fast");
      }, popUpTime);
    }
  });
}

// ----------------------------------------------------------------------------
// LINE FUNCTIONS -------------------------------------------------------------
// ----------------------------------------------------------------------------

window.onresize = function(event) {
  createLines();
  // setSearchField();
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
  $("#svgContainer").fadeIn("fast");
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
