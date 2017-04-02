"use strict";
window.utils = (function () {

  let topMenuToggle = document.querySelector(".top-menu__toggle");
  let mainNav = topMenuToggle.parentNode.querySelectorAll(".main-nav");

  topMenuToggle.addEventListener("click", function() {
    for (var i = 0; i < mainNav.length; i++) {
      mainNav[i].classList.toggle("main-nav_show");
    }
    topMenuToggle.classList.toggle("top-menu__toggle_close");
  });

})();;
