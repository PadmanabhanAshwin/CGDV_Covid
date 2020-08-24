var slideIndex = 1;
showDivs(slideIndex);

var thisbox = document.getElementById("Indonesia".concat("left"));
thisbox.style.display = "block";

var thisbox = document.getElementById("Sri Lanka".concat("right"));
thisbox.style.display = "block";

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function currentDiv(n) {
  showDivs(slideIndex = n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  if (n > x.length) {slideIndex = 1}
  if (n < 1) {slideIndex = x.length}
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace("dot-select", "");
  }
  x[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " dot-select";
}
