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

    // Safety net: a large instant jump (anchor link, "scroll to" button, or a
    // fast fling) can move an element straight from fully-below to
    // fully-above the viewport without its intersection ratio ever crossing
    // the threshold, so the observer never fires for it. Catch those directly.
    var sweepPastElements = function () {
      var viewportH = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("in-view")) return;
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportH) {
          // Already off-screen in either direction after a jump — if it's
          // above the viewport the user has passed it, so just show it.
          if (rect.bottom < 0) {
            el.classList.add("in-view");
            io.unobserve(el);
          }
        }
      });
    };
    var sweepTicking = false;
    var scheduleSweep = function () {
      if (!sweepTicking) {
        window.requestAnimationFrame(function () {
          sweepPastElements();
          sweepTicking = false;
        });
        sweepTicking = true;
      }
    };
    window.addEventListener("scroll", scheduleSweep, { passive: true });
    window.addEventListener("hashchange", scheduleSweep);
    scheduleSweep();
  }

  // Copy-to-clipboard buttons (contact page).
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetEl = document.getElementById(btn.getAttribute("data-copy-target"));
      if (!targetEl) return;
      var text = targetEl.textContent.trim();
      var showCopied = function () {
        var original = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied, function () {
          fallbackCopy(text);
          showCopied();
        });
      } else {
        fallbackCopy(text);
        showCopied();
      }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
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
