// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Wikipedia
// Edited Video: https://youtu.be/RPz75gcHj18

let welcomeText = "HELLO!\nYou are seeing a beta experiment which might not always work. If you'd like to help me, disable your adblock, so I see what you enjoy.\n\nHOW TO USE:\nType a search term and hit ENTER.";

let searchUrl = 'https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
let contentUrl = 'https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=';
let parseUrl = 'https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=';

let userInput;
let term;
let title;
let header;
let resultDiv;
let ready = true;

// 500
// let maxAccuracy = 0.8;
// let minAccuracy = 0.7;

// let slider = document.getElementById("sVal");
// let accuracy = slider.value;
// slider.addEventListener('change', event => {
//   accuracy = slider.value;
// });

let allCats = {};
let catRanking = [];
let searched = 0;
let received = 0;
let maxArticles = 70;
let maxCategories = 100;
let ranColors = [];

let counter = -1;



function newColor(){
ranColors.push(randomColor());

  function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

function findSentenceWith(text, word) {
  // let regex = new RegExp("[^.?!]*(?<=[.?\\s!])" + word + "(?=[\\s.?!])[^.?!]*[.?!]", "gi");
  let regex = new RegExp("(?![{}])[^.?!]*(?<=[.?\\s!])" + word + "(?=[\\s.?!])[^.?!]*[.?!]", "gi");
  return text.match(regex);
}

function setDomText(field, text) {
  field.innerText = text;
}

function parsedTime() {
  let d = new Date();
  return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
}

// slider.oninput = function() {
//   console.log(this.value);
// }

function writeStatistics(txt) {
  let string = "";

  for (var i = 0; i < txt.length; i++) {
    string += txt[i];
    string += ",";
  }

  // remove ; and add \n
  string = string.substring(string.length - 1, 0);
  string += "\n";

  var data = new FormData();
  data.append("data", txt);
  var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
  xhr.open('post', 'http://michaelschoenenberger.ch/wiki-api-v1/receiver.php', true);
  xhr.send(data);
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

$('#resetButton').click(reset());

function reset(){
  catRanking = [];
  ranColors = [];
  fillDiv();
}

function setup() {
  noCanvas();
  userInput = select('#userinput');

  // header = document.getElementById('title');
  link = document.getElementById('link');
  resultDiv = document.getElementById('resultDiv');
  // userInput.changed(startSearch);

  $('#userinput').keypress(function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13' && ready) {
      term = userInput.value();
      startSearch(term);
    }
  });

  //goWiki(userInput.value());

  function startSearch(term) {
    ready = false;
    allCats = {};

    // setDomText(header, "Please Wait");
    // setDomText(resultDiv, "");
    // goWiki(term);
    // goWiki500(term);
    goWikiCats(term);
  }

  // function goWiki(term) {
  //
  //   if (counter < 1) {
  //     counter = counter + 1;
  //     //let term = userInput.value();
  //     let url = searchUrl + term;
  //     loadJSON(url, gotSearch);
  //   }
  // }

  // function gotSearch(data) {
  //   let len = data[1].length;
  //   let index = floor(random(len));
  //   title = data[1][index];
  //   console.log("title:");
  //   console.log(title);
  //   setDomText(header, title);
  //   // console.log(random(data[1]));
  //   createDiv(title);
  //   title = title.replace(/\s+/g, '_');
  //   console.log('Querying: ' + title);
  //   let url = contentUrl + title;
  //   loadJSON(url, gotContent);
  // }

  function goWiki500(term) {
    counter++;
    let url = "https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=500&srsearch=" + term + "&utf8=&format=json";
    loadJSON(url, gotSearch500);
  }

  function goWikiCats(term) {
    counter++;
    newColor();
    let url = "https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=" + maxArticles + "&srsearch=" + term + "&utf8=&format=json";
    loadJSON(url, gotSearchCats);
  }

  function gotSearch500(data) {

    // console.log(data);
    // let len = data[1].length;
    // let index = floor(random(len));
    // let title = data[1][index];

    let index = round(map_range(accuracy, 0, 1, 0, data.query.search.length - 1));
    // let index = data.query.search.length - round(accuracy * (data.query.search.length-1));

    // let index = data.query.search.length - floor(random(minAccuracy, maxAccuracy) * data.query.search.length) - counter;
    // let index = floor(random(minAccuracy,maxAccuracy)*data.query.search.length) + counter;
    title = data.query.search[index].title;
    // title = "Cloud";
    // // console.log(random(data[1]));

    setDomText(header, title);
    console.log('Loaded Article ' + index + ' of ' + data.query.search.length);
    title = title.replace(/\s+/g, '_');
    link.href = "https://en.wikipedia.org/wiki/" + title;

    console.log('Querying: ' + title);
    let url = parseUrl + title;
    // console.log("URL = "+url);
    writeStatistics([parsedTime(), term, link]);
    loadJSON(url, gotParsed);
  }

  function gotSearchCats(data) {
    for (var i = 0; i < data.query.search.length; i++) {
      title = data.query.search[i].title;
      title = title.replace(/\s+/g, '_');
      getCategories(title);
    }
  }

  function gotParsed(data) {
    let txt = data.parse.text['*'];
    // console.log(txt);

    // txt = markTerm(txt, term);

    $('#resultDiv').html(txt).promise().done(function() {
      //fix wiki links
      $(this).find('a').each(function(index, el) {
        let link = $(this).attr('href');
        if (link) {
          if (link.substring(0, 5) == '/wiki') {
            link = 'https://en.wikipedia.org' + link;
            $(this).attr('href', link);
          }
        }
      });

      // mark terms
      $(this).mark(term, {
        'element': 'span',
        'className': 'term'
      });
    });

    ready = true;
  }

  // function markTerm(text, targetWord) {
  //
  //   var wordList = targetWord.split(" ");
  //   // console.log(wordList);
  //
  //   for (var i = 0; i < wordList.length; i++) {
  //     let regex = new RegExp(wordList[i], "gi");
  //     let highlighted = '<span class="term">' + wordList[i] + '</span>';
  //     text = text.replace(regex, highlighted);
  //   }
  //
  //   return text;
  // }

  function getCategories(title) {
    allCats[title] = {};
    allCats[title].categories = [];

    let catRequestURL = 'https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=query&prop=categories&cllimit='+ maxCategories +'&clshow=!hidden&titles=' + title + '&utf8=&format=json';
    loadJSON(catRequestURL, function(data) {
      let id = Object.keys(data.query.pages);
      let cats = data.query.pages[id].categories;
      for (var i = 0; i < cats.length; i++) {
        let cat = cats[i].title.substr(9);
        allCats[title].categories.push(cat);
      }
      searched++;
      handleCategories();
    });
  }



  // getCategories('Italy');
  // getCategories('Netherlands');
  // getCategories('Germany');
  // getCategories('Cold_War');
  // getCategories('World_War');
  // getCategories('Austria');

  function handleCategories() {
    // console.log(allCats);
    let articleNames = Object.keys(allCats);

    //loop through all loaded articles
    for (var i = 0; i < articleNames.length; i++) {
      let thisCats = allCats[articleNames[i]].categories;

      //loop through all categories within article
      for (var k = 0; k < thisCats.length; k++) {
        let catExisting = false;
        let existingIndex;

        //check if category exists
        for (var j = 0; j < catRanking.length; j++) {
          // console.log(catRanking[j].name);
          if (catRanking[j].name == thisCats[k]) {
            catExisting = true;
            existingIndex = j;
          }
        }

        if (!catExisting) {
          //if not existing, add
          let obj = {};
          obj.articles = [];
            let o2 = {};
            o2.n = articleNames[i];
            o2.c = counter;
          obj.articles.push(o2);
          obj.name = thisCats[k];

          catRanking.push(obj);
        } else {
          let obj = catRanking[existingIndex];
          // console.log(obj.name);

          let artExists = false;
          for (var j = 0; j < obj.articles.length; j++) {
            if (obj.articles[j].n == articleNames[i] && obj.articles[j].c == counter ) {
              artExists = true;
            }
          }

          if (!artExists) {
            let o2 = {};
            o2.n = articleNames[i];
            o2.c = counter;
            obj.articles.push(o2);
          }
        }
      }
    }



    received++;
    if (searched == received) {
      // console.log(searched + ' searched');
      // console.log(received + ' received');
      sortByAmount();
    }
  }

  function sortByAmount() {
    catRanking.sort(function(arr1, arr2) {
      return arr2.articles.length - arr1.articles.length;
    });

    fillDiv();
  }
}

function fillDiv() {
  // console.log(catRanking);
  let el = '';
  for (var i = 0; i < catRanking.length; i++) {
    el += '<h2>' + catRanking[i].name + '</h2><ul>';

    for (var k = 0; k < catRanking[i].articles.length; k++) {
      el += '<li style="color:'+ranColors[catRanking[i].articles[k].c]+';">' + catRanking[i].articles[k].n + '</li>';
    }

    el += '</ul>';
  }
  $('#resultDiv').html(el);
  ready = true;
}

// alert(welcomeText);
