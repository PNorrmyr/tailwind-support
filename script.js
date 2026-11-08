(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll-reveal: fade/slide elements in as they enter the viewport.
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 60, 240) + "ms";
      io.observe(el);
    });
  }

  // Subtle parallax drift on the phone stack as the page scrolls.
  var parallaxEl = document.querySelector("[data-parallax]");
  if (parallaxEl && !prefersReducedMotion) {
    var ticking = false;
    var update = function () {
      var rect = parallaxEl.getBoundingClientRect();
      var viewportH = window.innerHeight || document.documentElement.clientHeight;
      var center = rect.top + rect.height / 2 - viewportH / 2;
      var offset = Math.max(-18, Math.min(18, center * -0.04));
      parallaxEl.style.transform = "translateY(" + offset + "px)";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();

    // Gentle pointer tilt on desktop for a bit of depth.
    if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      parallaxEl.addEventListener("mousemove", function (e) {
        var rect = parallaxEl.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        parallaxEl.style.setProperty("--tiltX", (py * -5).toFixed(2) + "deg");
        parallaxEl.style.setProperty("--tiltY", (px * 6).toFixed(2) + "deg");
      });
      parallaxEl.addEventListener("mouseleave", function () {
        parallaxEl.style.setProperty("--tiltX", "0deg");
        parallaxEl.style.setProperty("--tiltY", "0deg");
      });
    }
  }
})();
