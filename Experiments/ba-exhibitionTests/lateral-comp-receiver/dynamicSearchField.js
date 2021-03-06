// RESIZING OF SEARCH BOX
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
  .on("input", function() {
    var inputWidth = $(this).textWidth();
    $(this).css({
      width: inputWidth
    });
  })
  .trigger("input");

function inputWidth(elem, minW, maxW) {
  elem = $(this);
  // console.log(elem)
}

var targetElem = $(".width-dynamic");

inputWidth(targetElem);

function setSearchWidth() {
  var inputWidth = $(".width-dynamic").textWidth();
  $(".width-dynamic").css({
    width: inputWidth
  });
}
// ------------------
