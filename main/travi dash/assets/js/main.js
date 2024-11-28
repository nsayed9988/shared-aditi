(function($) {
    ("use strict");
    // Page loading
    $(window).on("load", function() {
        $("#preloader-active").fadeOut("slow");
    });
    /*-----------------
        Menu Stick
    -----------------*/
    var header = $(".sticky-bar");
    var win = $(window);
    win.on("scroll", function() {
        var scroll = win.scrollTop();
        if (scroll < 200) {
            header.removeClass("stick");
            $(".header-style-2 .categories-dropdown-active-large").removeClass("open");
            $(".header-style-2 .categories-button-active").removeClass("open");
        } else {
            header.addClass("stick");
        }
    });
    /*------ ScrollUp -------- */
    // $.scrollUp({
    //     scrollText: '<i class="fi-rr-arrow-small-up"></i>',
    //     easingType: "linear",
    //     scrollSpeed: 900,
    //     animation: "fade"
    // });
    /*------ Wow Active ----*/
    new WOW().init();
    //sidebar sticky
    if ($(".sticky-sidebar").length) {
        $(".sticky-sidebar").theiaStickySidebar();
    }
    /*----------------------------
        Category toggle function
    ------------------------------*/
    if ($(".categories-button-active").length) {
        var searchToggle = $(".categories-button-active");
        searchToggle.on("click", function(e) {
            e.preventDefault();
            if ($(this).hasClass("open")) {
                $(this).removeClass("open");
                $(this).siblings(".categories-dropdown-active-large").removeClass("open");
            } else {
                $(this).addClass("open");
                $(this).siblings(".categories-dropdown-active-large").addClass("open");
            }
        });
    }
    /*---------------------
        Select active
    --------------------- */
    if ($(".select-active").length) {
        $(".select-active").select2();
    }
    /*---- CounterUp ----*/
    if ($(".count").length) {
        $(".count").counterUp({
            delay: 10,
            time: 2000
        });
    }
    // Isotope active
    if ($(".grid").length) {
        $(".grid").imagesLoaded(function() {
            // init Isotope
            var $grid = $(".grid").isotope({
                itemSelector: ".grid-item",
                percentPosition: true,
                layoutMode: "masonry",
                masonry: {
                    // use outer width of grid-sizer for columnWidth
                    columnWidth: ".grid-item"
                }
            });
        });
    }
    /*====== SidebarSearch ======*/
    function sidebarSearch() {
        var searchTrigger = $(".search-active"),
            endTriggersearch = $(".search-close"),
            container = $(".main-search-active");
        searchTrigger.on("click", function(e) {
            e.preventDefault();
            container.addClass("search-visible");
        });
        endTriggersearch.on("click", function() {
            container.removeClass("search-visible");
        });
    }
    sidebarSearch();
    /*====== Sidebar menu Active ======*/
    function mobileHeaderActive() {
        var navbarTrigger = $(".burger-icon"),
            endTrigger = $(".mobile-menu-close"),
            container = $(".mobile-header-active"),
            wrapper4 = $("body");
        wrapper4.prepend('<div class="body-overlay-1"></div>');
        navbarTrigger.on("click", function(e) {
            navbarTrigger.toggleClass("burger-close");
            e.preventDefault();
            container.toggleClass("sidebar-visible");
            wrapper4.toggleClass("mobile-menu-active");
        });
        endTrigger.on("click", function() {
            container.removeClass("sidebar-visible");
            wrapper4.removeClass("mobile-menu-active");
        });
        $(".body-overlay-1").on("click", function() {
            container.removeClass("sidebar-visible");
            wrapper4.removeClass("mobile-menu-active");
            navbarTrigger.removeClass("burger-close");
        });
    }
    mobileHeaderActive();
    /*---------------------
        Mobile menu active
    ------------------------ */
    var $offCanvasNav = $(".mobile-menu"),
        $offCanvasNavSubMenu = $offCanvasNav.find(".sub-menu");
    /*Add Toggle Button With Off Canvas Sub Menu*/
    $offCanvasNavSubMenu.parent().prepend('<span class="menu-expand"><i class="fi-rr-angle-small-down"></i></span>');
    /*Close Off Canvas Sub Menu*/
    $offCanvasNavSubMenu.slideUp();
    /*Category Sub Menu Toggle*/
    $offCanvasNav.on("click", "li a, li .menu-expand", function(e) {
        var $this = $(this);
        if (
            $this
            .parent()
            .attr("class")
            .match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/) &&
            ($this.attr("href") === "#" || $this.hasClass("menu-expand"))
        ) {
            e.preventDefault();
            if ($this.siblings("ul:visible").length) {
                $this.parent("li").removeClass("active");
                $this.siblings("ul").slideUp();
            } else {
                $this.parent("li").addClass("active");
                $this.closest("li").siblings("li").removeClass("active").find("li").removeClass("active");
                $this.closest("li").siblings("li").find("ul:visible").slideUp();
                $this.siblings("ul").slideDown();
            }
        }
    });
    /*--- language currency active ----*/
    $(".mobile-language-active").on("click", function(e) {
        e.preventDefault();
        $(".lang-dropdown-active").slideToggle(900);
    });
    /*--- categories-button-active-2 ----*/
    $(".categories-button-active-2").on("click", function(e) {
        e.preventDefault();
        $(".categori-dropdown-active-small").slideToggle(900);
    });
    /*--- Mobile demo active ----*/
    var demo = $(".tm-demo-options-wrapper");
    $(".view-demo-btn-active").on("click", function(e) {
        e.preventDefault();
        demo.toggleClass("demo-open");
    });
    /*-----More Menu Open----*/
    $(".more_slide_open").slideUp();
    $(".more_categories").on("click", function() {
        $(this).toggleClass("show");
        $(".more_slide_open").slideToggle();
    });
    /* --- SwiperJS --- */
    $(".swiper-group-10").each(function() {
        var swiper_10_items = new Swiper(this, {
            spaceBetween: 20,
            slidesPerView: 10,
            slidesPerGroup: 2,
            loop: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
            },
            pagination: {
                el: ".swiper-pagination-1",
                type: "custom",
                renderCustom: function(swiper, current, total) {
                    var customPaginationHtml = "";
                    for (var i = 0; i < total; i++) {
                        //Determine which pager should be activated at this time
                        if (i == current - 1) {
                            customPaginationHtml += '<span class="swiper-pagination-customs swiper-pagination-customs-active"></span>';
                        } else {
                            customPaginationHtml += '<span class="swiper-pagination-customs"></span>';
                        }
                    }
                    return customPaginationHtml;
                }
            },
            autoplay: {
                delay: 10000
            },
            breakpoints: {
                1199: {
                    slidesPerView: 10
                },
                800: {
                    slidesPerView: 8
                },
                600: {
                    slidesPerView: 6
                },
                400: {
                    slidesPerView: 4
                },
                250: {
                    slidesPerView: 2
                }
            }
        });
    });
    $(".swiper-group-1").each(function() {
        var swiper_1_items = new Swiper(this, {
            spaceBetween: 30,
            slidesPerView: 1,
            loop: true,
            navigation: {
                nextEl: ".swiper-button-next-1",
                prevEl: ".swiper-button-prev-1"
            },
            pagination: {
                el: ".swiper-pagination-1",
                type: "custom",
                renderCustom: function(swiper, current, total) {
                    var customPaginationHtml = "";
                    for (var i = 0; i < total; i++) {
                        //Determine which pager should be activated at this time
                        if (i == current - 1) {
                            customPaginationHtml += '<span class="swiper-pagination-customs swiper-pagination-customs-active"></span>';
                        } else {
                            customPaginationHtml += '<span class="swiper-pagination-customs"></span>';
                        }
                    }
                    return customPaginationHtml;
                }
            },
            autoplay: {
                delay: 10000
            }
        });
    });
    //Dropdown selected item
    $(".dropdown-menu li a").on("click", function(e) {
        if ($(this).parents(".dropdown").find(".btn span").length > 0) {
            e.preventDefault();
            $(this)
                .parents(".dropdown")
                .find(".btn span")
                .html($(this).text());
            $(this).parents(".dropdown").find(".btn").val($(this).data("value"));
        }
    });
    $(".list-tags-job .remove-tags-job").on("click", function(e) {
        e.preventDefault();
        $(this).closest(".job-tag").remove();
    });
    // Video popup
    if ($(".popup-youtube").length) {
        $(".popup-youtube").magnificPopup({
            type: "iframe",
            mainClass: "mfp-fade",
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });
    }
    $("#circle-staticstic-demo").circliful({
        animation: 1,
        foregroundBorderWidth: 10,
        backgroundBorderWidth: 10,
        percent: 67,
        percentageTextSize: 20,
        textStyle: "font-size: 20px; font-weight: bold; font-family: 'Plus Jakarta Sans', sans-serif",
        fontColor: "#05264E",
        fillColor: "#d8e0fd",
        backgroundColor: "#d8e0fd",
        multiPercentage: 0,
        targetTextSize: 20
    });
    $(".btn-expanded").on('click', function(){
        if ($(this).hasClass('btn-collapsed')) {
            $(this).removeClass("btn-collapsed");
            $("div.nav").removeClass('close-nav');
        } else {
            $(this).addClass("btn-collapsed");
            $("div.nav").addClass("close-nav");
        }
    });
    // $("input").on("change", function () {
    //     this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format(this.getAttribute("data-date-format")));
    // }).trigger("change");
    $(document).on('click', function(event) {
        var _ele_lang = $(".icon-lang");
        var _ele_currency = $(".icon-cart");
        if (!_ele_lang.is(event.target) && _ele_lang.has(event.target).length === 0) {
            $(".dropdown-account").removeClass("dropdown-open");
        }
        if (!_ele_currency.is(event.target) && _ele_currency.has(event.target).length === 0) {
            $(".dropdown-cart").removeClass("dropdown-open");
        }
    });
    $(".icon-account").on("click", function () {
        $(".dropdown-cart").removeClass("dropdown-open");
        $(this).next(".dropdown-account").toggleClass("dropdown-open");
    });
    $(".icon-cart").on("click", function () {
        $(".dropdown-account").removeClass("dropdown-open");
        $(this).next(".dropdown-cart").toggleClass("dropdown-open");
    });
    $('#calendar-events').datepicker({
        todayHighlight: true
    });
    $('.input-daterange input').each(function() {
        $(this).datepicker('clearDates');
    });
    $(".change-mode").on("click", function(e){
        e.preventDefault();
    });
    $(".btn-addmore").click(function(e){
        e.preventDefault();
        var number = $(".item-extra-service").length + 1;
        var html = '<div class="item-extra-service">'+
            '<div class="item-extra-1"> <input class="form-control" type="text" placeholder="Service title '+number+'" /></div>'+
            '<div class="item-extra-2"> <input class="form-control" type="text" placeholder="Price ($)" /></div>'+
            '<div class="item-extra-3"><a class="btn-remove" href="#"><svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7778 10.1111V15.4444" stroke="" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.22217 10.1111V15.4444" stroke="" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.66699 6.55556V17.2222C5.66699 18.2041 6.46293 19 7.44477 19H14.5559C15.5377 19 16.3337 18.2041 16.3337 17.2222V6.55556" stroke="" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3.88916 6.55556H18.1114" stroke="" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6.55566 6.55556L8.33344 3H13.6668L15.4446 6.55556" stroke="" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path></svg></a></div>'+
        '</div>';
        $(".box-extra-services").append(html);
    });
    $(document).on("click", ".btn-remove", function(e){
        e.preventDefault();
        if ($(".item-extra-service").length > 1 ) {
            var _this = $(this).parents(".item-extra-service");
            _this.remove();
            setPlaceholderInput();
        }
    });
    $(".main-menu > li > a").on("click", function(e){
        var _this = $(this);
        $(".main-menu > li").removeClass("active");
        $(".sub-menu").slideUp();
        _this.parent("li").addClass("active");
        if (_this.attr('href') == "#") {
            e.preventDefault();
            if (_this.next("ul").css("display") == "none") {
                _this.next("ul").slideDown();
            } else {
                _this.next("ul").slideUp();
            }
        }
    });
    function setPlaceholderInput() {
        $(".item-extra-service").each(function(index){
            var _input = $(this).find(".item-extra-1");
            let numinput = parseInt(index) + 1;
            _input.find("input").attr("placeholder","Service title "+ numinput +"");
        });
    }
})(jQuery);

// script.js

// Mock data (replace with dynamic data from your backend or API)
const tripData = {
    totalTrips: 12,
    upcomingTrips: 3,
    pastTrips: 8,
    activeTrip: "Beach"
  };
  
  // Populate the dashboard stats
  document.getElementById("total-trips").textContent = tripData.totalTrips;
  document.getElementById("upcoming-trips").textContent = tripData.upcomingTrips;
  document.getElementById("past-trips").textContent = tripData.pastTrips;
  document.getElementById("active-trip").textContent = tripData.activeTrip || "None";

  


// script.js


  
  // Function to save edits when input loses focus
  function saveEdit(input) {
    const newValue = input.value.trim();
    const parent = input.parentElement;
  
    // Update the parent element with the new value, preserving styles
    parent.textContent = newValue || 'N/A';
    parent.style.fontSize = '1.8rem';
    parent.style.color = '#4caf50';
    parent.style.margin = '0';
    parent.style.fontWeight = 'bold'; // Bold style for saved value
  }
// Function to enable editing of the Trip Overview cards
function editOverview() {
    const cards = document.querySelectorAll('.stat-card h3');
    document.getElementById('save-btn').disabled = false;
  
  
    cards.forEach((card) => {
      if (card.querySelector('input')) return;
  
      const currentValue = card.textContent;
      card.innerHTML = `<input type="text" value="${currentValue}" onblur="saveEdit(this)" class="edit-input" />`;
  
      const input = card.querySelector('input');
      input.style.fontSize = '1.8rem';
      input.style.color = '#4caf50';
      input.style.margin = '0';
      input.style.textAlign = 'center';
      input.style.width = '100%';
      input.style.border = 'none';
      input.style.background = 'transparent';
      input.style.outline = 'none';
      input.style.fontWeight = 'bold';
    });
  }
  
  // Function to save edits when input loses focus
  function saveEdit(input) {
    const newValue = input.value.trim();
    const parent = input.parentElement;
    parent.textContent = newValue || 'N/A';
    parent.style.fontSize = '1.8rem';
    parent.style.color = '#4caf50';
    parent.style.margin = '0';
    parent.style.fontWeight = 'bold';
  }
  
  // Save the changes when Save button is clicked
  function saveChanges() {
    const cards = document.querySelectorAll('.stat-card input');
    cards.forEach((input) => {
      saveEdit(input); // Save each change in the input fields
    });
    alert("Trip Overview Updated"); // Optional: Add a confirmation message
  }
// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 6,
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    locationButton
  );
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

window.initMap = initMap;

  