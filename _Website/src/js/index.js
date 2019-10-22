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

const svgPathD = points => {
  return points.reduce(
    (acc, point, i, a) =>
      i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${bezierCommand(point, i, a)}`,
    ""
  );
};

// ----------------------------------------------------------------------------
// RESIZING OF SEARCHBOX ------------------------------------------------------
// ----------------------------------------------------------------------------

$.fn.textWidth = function(text, font) {
  if (!$.fn.textWidth.fakeEl)
    $.fn.textWidth.fakeEl = $("<span>")
      .hide()
      .addClass("fakeEl")
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
  var inputWidth = $(".width-dynamic").textWidth() + 4;
  $(".width-dynamic").css({
    width: inputWidth
  });
}

$(document).ready(function() {
  setSearchField();
});

function inputWidth(elem, minW, maxW) {
  elem = $(this);
}

var targetElem = $(".width-dynamic");

inputWidth(targetElem);

// ----------------------------------------------------------------------------
// START MAIN -----------------------------------------------------------------
// ----------------------------------------------------------------------------

const searchUrl =
  "https://en.wikipedia.org/w/api.php?action=query&origin=*&list=search&utf8=&format=json&srlimit=500&srsearch=";
const parseUrl =
  "https://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&prop=text&page=";

const roundSvg = document.querySelector("#round-svg");
const header = document.querySelector("#title");
const link = document.querySelector("#link");
const resultDiv = document.querySelector("#resultDiv");
const userInput = document.querySelector("#userinput");
const debug = false;

let term;
let title;
let cardTitle;
let correctTitle;
let plot;
let ready = true;
let maxAccuracy = 0.8;
let minAccuracy = 0.65;

let home = true;

//line stuff
let lineList = [];
let curLinePos = 0;

window.history.pushState({ home: true }, "");

// ----------------------------------------------------------------------------
// GENERAL FUNCTIONS ----------------------------------------------------------
// ----------------------------------------------------------------------------

function random(min, max) {
  return Math.random() * (+max - +min) + +min;
}

// ----------------------------------------------------------------------------
// SEARCH FUNCTIONS -----------------------------------------------------------
// ----------------------------------------------------------------------------

$("#userinput").keypress(function(event) {
  let keycode = event.keyCode ? event.keyCode : event.which;
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
  exitHome();
  hideHeader();
  hideContent(true);
  emptyLines();

  search(term);
}

function resetSearch() {
  setSearchField();
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
  // if (!home) {
  //   $("#title").removeClass("highlighted");
  // } else {
  //   $("#title").addClass("highlighted");
  // }
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
    .fail(function(e) {
      errorHandler("Search Failed. Sorry!");
      if (debug) {
        console.log("Error while searching for term:" + e);
      }
    });
}

function receivedSearch(data) {
  if (data.query.search.length) {
    let index =
      data.query.search.length -
      1 -
      Math.floor(random(minAccuracy, maxAccuracy) * data.query.search.length);

    title = data.query.search[index].title;
    correctTitle = data.query.search[0].title;
    cardTitle = title;

    setHeader(title, function() {
      if (debug) {
        console.log(
          "Loaded Article " + index + " of " + data.query.search.length
        );
        console.log("Querying: " + title);
      }
      title = title.replace(/\s+/g, "_");
      link.href = "https://en.wikipedia.org/wiki/" + title;

      setHistory();
      let url = parseUrl + title;
      $.ajax({
        url: url,
        dataType: "json"
      })
        .done(gotParsed)
        .fail(function(e) {
          errorHandler("Couldn't load article. Sorry!");
          if (debug) {
            console.log("Error while parsing data:" + e);
          }
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
  if (debug) {
    console.log("POPSTATE: " + event);
  }

  if (event.state) {
    hideContent();
    emptyLines();

    if (event.state.home) {
      if (debug) {
        console.log("home");
      }
      showHome();
    } else {
      exitHome();
      userInput.value = event.state.term;
      changeHeader(event.state.cardTitle, function() {
        let url = parseUrl + event.state.title;
        $.ajax({
          url: url,
          dataType: "json"
        })
          .done(gotParsed)
          .fail(function(e) {
            errorHandler("Couldn't load article. Sorry!");
            if (debug) {
              console.log("Error while parsing data:" + e);
            }
          });
      });
    }

    setSearchField();
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

    $("#resultDiv")
      .html(txt)
      .promise()
      .done(applyStyle);
  } catch (e) {
    errorHandler("Couldn't load article. Sorry!");
    if (debug) {
      console.log("Error while parsing data:" + e);
    }
  }
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
                      $.ajax({
                        url: url,
                        dataType: "json"
                      })
                        .done(gotParsed)
                        .fail(function(e) {
                          errorHandler("Couldn't load article. Sorry!");
                          if (debug) {
                            console.log("Error while parsing article:" + e);
                          }
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

  if (!true) {
    $("#copyright")
      .clone()
      .removeAttr("style") //REMOVE FOR EXHIBITION
      .appendTo(this);
  }

  //mark first p (mostly short description)
  $(".mw-parser-output > p:first").addClass("first-p");

  createLines();
  $("img").on("load", createLines);
  $("#resultDiv")
    .find("*")
    .on("load", createLines);

  ready = true;
  showContent();
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
      .find("svg path")
      .attr("d", "");
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

  $("#round-svg path").attr("d", svgPathD(lineList));

  try {
    var pathLength = document.querySelector("#round-svg path").getTotalLength();
    $("#round-svg path").css({
      "stroke-dasharray": pathLength,
      "stroke-dashoffset": pathLength,
      "animation-duration": Math.round(pathLength / 1500) + "s"
    });
  } catch (error) {
    if (debug) {
      console.log(error);
    }
  }

  $("#svgContainer").fadeIn("fast");
}

$("#projTitle").click(function() {
  // $("#cardAlert")
  //   .addClass("active")
  //   .css("max-height", "calc(100vh - 64px)");
  // $("body").css("overflow", "hidden");
  // $(this).fadeOut("fast");
  if (!home) {
    showHome();
  }
});

function showHome() {
  home = true;
  // $("#projTitle").fadeOut("fast");
  // $("#title").removeClass("highlighted");
  hideBoth();
  changeHeader("Lateral Computation", function() {
    $("#resultDiv")
      .html(
        '<div class="mw-parser-output" style=""><p class="first-p"><i><b>Lateral Computation</b></i> is the outcome of a Bachelor of Arts project at the <a href="http://www.iad.zhdk.ch" title="Interaction Design">Interaction Design</a> departement of the <a href="http://www.zhdk.ch" title="ZHdK">ZHdK</a>, developed by <a href="http://www.michaelschoenenberger.ch" title="Michael Schönenberger">Michael Schönenberger</a>.</p><h2>How to use</h2><p>In order to make use of the knowledge retrieval system, enter a term in the search field above and then click on the arrow sign next to the input field or the <i>Enter</i> key on your keyboard.</p><h2>Project Description</h2><p>The presence of computer networks and the associated algorithms rises daily. Filter systems on the internet offer less and less room for unexpected, yet refreshing, encounters. As most of the existing systems aim for precision and personalization of these filters there are little applications that address the aforementioned aspect. Lateral Computation explores the potential of enforcing serendipity in knowledge retrieval systems by making use of alternative computation. The experiments implemented within this thesis have been utilized to analyze users behavior and the very nature of serendipitous confrontations. Lateralcomputation.ch - being the practical outcome of previous testings and experiences - is a website that makes use of the MediaWiki API to display articles of knowledge. After querying a term, the user stumbles upon a serendipitous article in relation to the entered term.</p></div></div>'
      )
      .promise()
      .done(applyStyle);
  });
}

function exitHome() {
  home = false;
  // $("#projTitle").fadeIn("fast");
  // $("#title").removeClass("highlighted");
  console.log("exit");
}
