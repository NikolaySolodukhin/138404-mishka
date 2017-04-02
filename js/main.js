'use strict';

  ymaps.ready(function() {
    var myMap = new ymaps.Map("map-canvas", {
      center: [59.935955, 30.321965],
      zoom: 16
    }, {
      searchControlProvider: "yandex#search"
    }),
    myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
      hintContent: "Собственный значок метки",
      balloonContent: "HTML Academy"
    }, {
      iconLayout: "default#image",
      iconImageHref: "img/icon-map-pin.svg",
      iconImageSize: [78, 138],
      iconImageOffset: [-45, -137]
    });

    myMap.geoObjects.add(myPlacemark);
  });
