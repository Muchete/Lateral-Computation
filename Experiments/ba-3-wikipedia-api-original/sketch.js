// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Wikipedia
// Edited Video: https://youtu.be/RPz75gcHj18

let welcomeText =
  "HELLO!\nYou are seeing a beta experiment which might not always work. If you'd like to help me, disable your adblock, so I see what you enjoy.\n\nHOW TO USE:\nType a search term and hit ENTER.";

let searchUrl =
  "https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=";
let contentUrl =
  "https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=";

let userInput;
let term;
let title;
let header;
let resultDiv;

// 500
let maxAccuracy = 0.8;
let minAccuracy = 0.7;

let counter = 0;

function findSentenceWith(text, word) {
  // let regex = new RegExp("[^.?!]*(?<=[.?\\s!])" + word + "(?=[\\s.?!])[^.?!]*[.?!]", "gi");
  let regex = new RegExp(
    "(?![{}])[^.?!]*(?<=[.?\\s!])" + word + "(?=[\\s.?!])[^.?!]*[.?!]",
    "gi"
  );
  return text.match(regex);
}

function setDomText(field, text) {
  field.innerText = text;
}

function setup() {
  noCanvas();
  userInput = select("#userinput");

  header = document.getElementById("title");
  link = document.getElementById("link");
  resultDiv = document.getElementById("resultDiv");
  // userInput.changed(startSearch);

  $("#userinput").keypress(function(event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      term = userInput.value();
      startSearch(term);
    }
  });

  //goWiki(userInput.value());

  function startSearch(term) {
    counter = 0;
    setDomText(header, "Please Wait");
    setDomText(resultDiv, "");
    // goWiki(term);
    goWiki500(term);
  }

  function goWiki(term) {
    if (counter < 1) {
      counter = counter + 1;
      //let term = userInput.value();
      let url = searchUrl + term;
      loadJSON(url, gotSearch);
    }
  }

  function gotSearch(data) {
    let len = data[1].length;
    let index = floor(random(len));
    title = data[1][index];
    console.log("title:");
    console.log(title);
    setDomText(header, title);
    // console.log(random(data[1]));
    createDiv(title);
    title = title.replace(/\s+/g, "_");
    console.log("Querying: " + title);
    let url = contentUrl + title;
    loadJSON(url, gotContent);
  }

  function goWiki500(term) {
    counter++;
    let url =
      "https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=500&srsearch=" +
      term +
      "&utf8=&format=json";
    loadJSON(url, gotSearch500);
  }

  function gotSearch500(data) {
    // console.log(data);
    // let len = data[1].length;
    // let index = floor(random(len));
    // let title = data[1][index];

    let index =
      data.query.search.length -
      floor(random(minAccuracy, maxAccuracy) * data.query.search.length) -
      counter;
    title = data.query.search[index].title;
    // title = "Cloud";
    // // console.log(random(data[1]));

    setDomText(header, title);
    title = title.replace(/\s+/g, "_");
    link.href = "https://en.wikipedia.org/wiki/" + title;
    console.log("Querying: " + title);
    let url = contentUrl + title;
    // console.log("URL = "+url);
    loadJSON(url, gotContent);
  }

  function gotContent(data) {
    let page = data.query.pages;
    let pageId = Object.keys(data.query.pages)[0];
    // console.log(pageId);
    let content = page[pageId].revisions[0]["*"];

    // find sentences
    displaySentences(content, term);

    // rankWords
    // let wordRegex = /\b\w{4,}\b/g;
    // let words = content.match(wordRegex);
    // rankWords(words);

    // repeat?
    // let word = random(words);
    // goWiki(word);
    // console.log(word);
  }

  function displaySentences(content, term) {
    console.log("looking for " + term);
    let result = findSentenceWith(content, term);
    let msg = "";
    if (result) {
      console.log(result);
      for (var i = 0; i < result.length; i++) {
        msg += result[i];
        msg += "\n\n";
      }
      counter = 0;
      setDomText(resultDiv, msg);
    } else {
      console.log("No " + term + " found in any sentence...");
      console.log("\nDoing it again:");
      goWiki500(term);
    }
  }

  function rankWords(words) {
    let wordlist = {};

    for (var i = 0; i < words.length; i++) {
      if (wordlist[words[i]] >= 1) {
        wordlist[words[i]]++;
      } else {
        wordlist[words[i]] = 1;
      }
    }

    let wordRanking = Object.keys(wordlist).sort(function(a, b) {
      return wordlist[b] - wordlist[a];
    });
    console.log("Word number one is: " + wordRanking[0]);
  }
}

alert(welcomeText);
