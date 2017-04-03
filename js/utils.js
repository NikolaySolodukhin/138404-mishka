'use strict';

window.utils = (function () {

  var topMenuToggle = document.querySelector('.top-menu__toggle');
  var mainNav = topMenuToggle.parentNode.querySelectorAll('.main-nav');
  var modalWindow = document.querySelector('.modal-window');
  var order = document.querySelectorAll('.btn_product, .product__add');

  for (var i = 0; i < mainNav.length; i++) {
    mainNav[i].classList.remove('main-nav_nojs');
  }

  topMenuToggle.addEventListener('click', function() {
    for (var i = 0; i < mainNav.length; i++) {
      mainNav[i].classList.toggle('main-nav_show');
    }
    topMenuToggle.classList.toggle('top-menu__toggle_close');
  });


  for (var i = 0; i < order.length; i++) {
    order[i].addEventListener('click', function(event) {
      event.preventDefault();
      modalWindow.classList.add('modal-window_show');
    });
  }

  window.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) {
      if (modalWindow.classList.contains('modal-window_show')) {
        modalWindow.classList.remove('modal-window_show');
      }
    }
  });

})();
