var allLinks = [];
var url;
var domain;
var nextSite = false;

function getDomain(str){
  str = String(str);
  return str.match('(?<=\/\/).+?(?:\..?.?.?\/)');
}

$(document).ready(function() {
  var ifr = document.getElementById('iFrame');
  url = ifr.src;
  domain = getDomain(url)[0];

  function handleHTML(html) {
    // console.log(html);
    allLinks = [];
    var baseDomain = getDomain(url)[0];
    // if (baseDomain[baseDomain.length-1] != "/"){
    //   baseDomain.push("/");
    // }

    $(html).find("a").each(function(index, el) {
      if (el){
        var a = $(el).attr('href');
        if (a && a != '##' && a[0] != 'j'){
          if (nextSite){
            if (getDomain(a)){
              if (getDomain(a)[0] != baseDomain){
                allLinks.push(a);
              }
            }
          } else {
            if (a){
              var doms = getDomain(a);
              if (!doms) {
                if (a[0]=='/'){
                  a = a.substr(1);
                }
                a = "https://"+ domain + a;
              }
            }
            allLinks.push(a);
          }
        }
      }
    });
    console.log("found these links: ");
    console.log(allLinks);
    openRandom(allLinks);
  }

  function openRandom(links){
    if (links.length >=1){
      var link = links[Math.floor(Math.random()*links.length)];
      // console.log(link);
      console.log("GOING TO: " + link);
      openLink(link);
    } else {
      alert('NO LINKS FOUND');
    }
  }

  function openLink(link){
    domain = getDomain(link)[0];
    url = link;
    ifr.src = link;
    setTextfield(link);
    nextSite = false;
  }

  function gotoRandomLink(){
    var queryURL = "https://cors-anywhere.herokuapp.com/" + url
    console.log(queryURL);
    $.ajax({
      url: queryURL,
      method: "GET",
      dataType: "html",
      // this headers section is necessary for CORS-anywhere
      headers: {
        "x-requested-with": "xhr"
      }
    }).done(function(response) {
      handleHTML(response);
    }).fail(function(jqXHR, textStatus) {
      console.error(textStatus)
    })
  }

  $("#launch").click(function(event) {
    gotoRandomLink();
  });

  $("#nextSite").click(function(event) {
    nextSite = true;
    gotoRandomLink();
  });

  $("#overlayDiv").click(function(event) {
    // gotoRandomLink();
    alert("click");
  });

  $('iframe').click(function(event) {
    gotoRandomLink();
  });

  /* Text field */
  function setTextfield(url){
    $("#urlTextbox").val(url);
  }

  $("#urlTextbox").val(url);

  $("#urlTextbox").focusout(function(e) {
      if ($(this).val() == "") {
          $(this).val(url);
      }
  });

  $('#urlTextbox').keypress(function(event){
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if(keycode == '13'){
          openLink($('#urlTextbox').val());
      }
  });

});
