!function(t){var e={};function n(i){if(e[i])return e[i].exports;var o=e[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(i,o,function(e){return t[e]}.bind(null,o));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="/dist/",n(n.s=0)}([function(t,e,n){n(1),t.exports=n(2)},function(t,e,n){},function(t,e){var n,i,o,r,a,s=function(t,e,n,i){var o,r,a,s,c=(o=e||t,a=(r=n||t)[0]-o[0],s=r[1]-o[1],{length:Math.sqrt(Math.pow(a,2)+Math.pow(s,2)),angle:Math.atan2(s,a)}),f=c.angle+(i?Math.PI:0),u=.25*c.length;return[t[0]+Math.cos(f)*u,t[1]+Math.sin(f)*u]},c=function(t){var e=t.reduce(function(t,e,n,i){return 0===n?"M ".concat(e[0],",").concat(e[1]):"".concat(t," ").concat(function(t,e,n){var i=s(n[e-1],n[e-2],t),o=s(t,n[e-1],n[e+1],!0);return"C ".concat(i[0],",").concat(i[1]," ").concat(o[0],",").concat(o[1]," ").concat(t[0],",").concat(t[1])}(e,n,i))},"");return'<path d="'.concat(e,'" fill="none" />')},f="https://en.wikipedia.org/w/api.php?action=query&origin=*&list=search&utf8=&format=json&srlimit=500&srsearch=",u="https://en.wikipedia.org/w/api.php?action=parse&origin=*&format=json&prop=text&page=",l=document.querySelector("#round-svg"),d=document.querySelector("#title"),h=document.querySelector("#link"),p=(document.querySelector("#resultDiv"),document.querySelector("#userinput")),m=new Date,v=15,g=15e3,y=!1,w=!0,b=.8,j=.65,x=[];function M(){w?((n=p.value)&&("muchete make a card please"==n?(p.value=i,n=i,console.log("manual Print!"),y=!0,D()):function(t){w=!1,q(),T(!0),_(),function(t){var e=f+t;$.ajax({url:e,dataType:"json"}).done(I).fail(S)}(t)}(n)),i=n):($("#title").add("#title .term").addClass("warn"),setTimeout(function(){$("#title").add("#title .term").removeClass("warn")},500))}function T(t){$("#resultDiv").fadeOut("fast",function(){t&&$(this).empty()})}function k(){$("#resultDiv").fadeIn({duration:"fast",start:function(){P()}})}function O(t,e){d.innerText=t,$("#title").fadeIn("fast",e)}function q(t){$("#title").fadeOut("fast",t)}function S(t){O("No results. Sorry!"),h.href="#",w=!0}function I(t){if(t.query.search.length){var e=t.query.search.length-Math.floor((i=j,a=b,(Math.random()*(+a-+i)+ +i)*t.query.search.length));o=t.query.search[e].title,r=o,t.query.search[0].title,O(o,function(){var t;o=o.replace(/\s+/g,"_"),h.href="https://en.wikipedia.org/wiki/"+o,t={title:o,cardTitle:r,term:n,home:!1},window.history.pushState(t,"");var e=u+o;$.ajax({url:e,dataType:"json"}).done(C).fail(S)})}else S();var i,a}function C(t){var e=t.parse.text["*"];$("#resultDiv").html(e).promise().done(A)}function A(){$(this).find("a").each(function(t,e){var n=$(this).attr("href");n&&"/wiki"==n.substring(0,5)&&($(this).attr("href","#"),$(this).click(function(t){if($(this).attr("title")){var e=$(this).attr("title");$("#title").fadeOut({duration:"fast",start:function(){T(),_()},complete:function(){d.innerText=e,$("#title").fadeIn({complete:function(){var t=e.replace(/\s+/g,"_");h.href="https://en.wikipedia.org/wiki/"+t;var n=u+t;$.ajax({url:n,dataType:"json"}).done(C).fail(S)}})}})}}))}),$(this).find("style").add(".mw-empty-elt").remove(),$(this).find("*").each(function(t,e){"none"==$(this).css("display")&&$(this).remove(),$(this).removeAttr("bgcolor"),$(this).removeAttr("style")}),$(this).find("img").removeAttr("width").removeAttr("height"),$(this).add("#title").mark(n,{element:"span",className:"term"}),$(this).prepend('<div class="left-lane"></div>'),$(this).find(".infobox").add(".toc").add(".tright").add(".vertical-navbox").appendTo(".left-lane"),$("#copyright").clone().removeAttr("style").appendTo(this),$(".mw-parser-output > p:first").addClass("first-p"),P(),$("img").on("load",P),$("#resultDiv").find("*").on("load",P);var t=0,e=$(this).find("img").length;e?$("img").on("load",function(n){++t==e&&(D(),w=!0,k())}):(w=!0,k())}function D(){var t,e,i;if($("#resultDiv").find("img").each(function(n,i){var o=$(this).attr("src");o.includes("/thumb")&&(o=(o=o.replace(/\/thumb/g,"")).substring(0,o.lastIndexOf("/"))),o.match(/.(jpg|jpeg|png|gif)$/i)&&(t?$(this).width()>t.width()&&(t=$(this),e=o):(t=$(this),e=o))}),t){(a=$(".first-p").remove(".reference").text()).endsWith("\n")&&(a=a.substring(0,a.lastIndexOf("\n")));var o=n.charAt(0).toUpperCase()+n.slice(1);((i=new Date)-m>60*v*1e3?(console.log("card '"+n+"' is being printed now: "+i),m=i,1):y&&(y=!1,1))&&setTimeout(function(){!function(t,e,n){$("#cardAlert").fadeIn({duration:"fast",start:function(){H.publish("/cardInfo","https:"+t+"|"+e+"|"+n)},complete:function(){setTimeout(function(){$("#cardAlert").fadeOut("fast")},g)}})}(e,o,a)},1e3)}}function _(){$("#svgContainer").fadeOut("fast",function(){$(this).find("svg").empty()})}function P(){x=[];var t=$("input.search"),e=$("body"),n=t.offset().left-e.offset().left+t.width()/2,i=t.position().top-e.offset().top+t.height()/2;x.push([n,i]),$("span.term").each(function(o,r){t=$(this),n=t.offset().left-e.offset().left+t.width()/2,i=t.offset().top-e.offset().top+t.height()/2,x.push([n,i])}),l.innerHTML=c(x),$("#svgContainer").fadeIn("fast")}window.history.pushState({home:!0},""),$.fn.random=function(){return this.eq(Math.floor(Math.random()*this.length))},$("#userinput").keypress(function(t){"13"==(t.keyCode?t.keyCode:t.which)&&M()}),$("#search-button").click(M),window.onpopstate=function(t){var e,n;console.log(t),t.state&&(T(),_(),t.state.home?q():(p.value=t.state.term,e=t.state.cardTitle,n=function(){var e=u+t.state.title;$.ajax({url:e,dataType:"json"}).done(C).fail(S)},$("#title").fadeOut("fast",function(){O(e,n)})))},window.onresize=function(t){P()};var H=mqtt.connect("wss://lc-sender:1c99172350e3efc0@broker.shiftr.io",{clientId:"lc-card-sender"});H.on("connect",function(){console.log("SHIFTR: client has connected!")})}]);