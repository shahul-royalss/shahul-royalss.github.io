/* ================================================================
   Shaik Shahul — Portfolio
   GSAP + ScrollTrigger + Lenis
================================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isDesktop = function () { return window.innerWidth > 768; };

  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", function () { if (window.ScrollTrigger) ScrollTrigger.update(); });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else {
      var el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }

  document.querySelectorAll("a[data-href]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToTarget(a.getAttribute("data-href"));
    });
  });

  /* ---------------- Split text helpers ---------------- */
  function splitChars(el) {
    // collect chars, preserving any wrapping element's class (e.g. .hat-h2 / .do-h2)
    var parts = [];
    el.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split("").forEach(function (ch) { parts.push({ ch: ch, cls: "" }); });
      } else if (node.nodeType === 1) {
        var cls = node.className || "";
        node.textContent.split("").forEach(function (ch) { parts.push({ ch: ch, cls: cls }); });
      }
    });
    el.textContent = "";
    var line = document.createElement("span");
    line.className = "split-line";
    line.style.display = "block";
    parts.forEach(function (p) {
      var s = document.createElement("span");
      s.className = "split-char" + (p.cls ? " " + p.cls : "");
      s.textContent = p.ch === " " ? "\u00A0" : p.ch;
      line.appendChild(s);
    });
    el.appendChild(line);
    return line.querySelectorAll(".split-char");
  }

  function splitWords(el) {
    var words = el.textContent.split(/\s+/).filter(Boolean);
    el.textContent = "";
    words.forEach(function (w) {
      var s = document.createElement("span");
      s.className = "split-word";
      s.textContent = w;
      el.appendChild(s);
      el.appendChild(document.createTextNode(" "));
    });
    return el.querySelectorAll(".split-word");
  }

  /* ---------------- Custom cursor ---------------- */
  var cursor = document.getElementById("cursorMain");
  if (cursor && isDesktop() && !reduceMotion) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var tx = cx, ty = cy;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    gsap.ticker.add(function () {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
    });
    document.querySelectorAll('[data-cursor="disable"]').forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("cursor-disable"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("cursor-disable"); });
    });
    var iconsArea = document.querySelector('[data-cursor="icons"]');
    if (iconsArea) {
      iconsArea.addEventListener("mouseenter", function () { cursor.style.setProperty("--size", "80px"); });
      iconsArea.addEventListener("mouseleave", function () { cursor.style.removeProperty("--size"); });
    }
  }

  /* ---------------- Magnetic social icons ---------------- */
  document.querySelectorAll(".social-icons span").forEach(function (span) {
    var link = span.querySelector("a");
    if (!link) return;
    span.addEventListener("mousemove", function (e) {
      var r = span.getBoundingClientRect();
      var mx = e.clientX - r.left;
      var my = e.clientY - r.top;
      link.style.setProperty("--siLeft", 50 + (mx - r.width / 2) * 0.9 + "%");
      link.style.setProperty("--siTop", 50 + (my - r.height / 2) * 0.9 + "%");
    });
    span.addEventListener("mouseleave", function () {
      link.style.setProperty("--siLeft", "50%");
      link.style.setProperty("--siTop", "50%");
    });
  });

  /* ---------------- Character interactivity ---------------- */
  var charModel = document.getElementById("characterModel");
  var charImg = document.getElementById("characterImg");
  if (charImg && !reduceMotion && isDesktop()) {
    // idle float
    gsap.to(charImg, { y: -10, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
    // mouse parallax + tilt
    window.addEventListener("mousemove", function (e) {
      var dx = (e.clientX / window.innerWidth - 0.5);
      var dy = (e.clientY / window.innerHeight - 0.5);
      gsap.to(charImg, {
        x: dx * 26,
        rotation: dx * 2.2,
        skewX: dx * 0.6,
        transformOrigin: "50% 90%",
        duration: 0.9,
        ease: "power2.out",
        overwrite: "auto"
      });
      var rim = document.getElementById("characterRim");
      if (rim) gsap.to(rim, { xPercent: -50 + dx * 8, duration: 1.2, ease: "power2.out", overwrite: "auto" });
    });
  }

  /* ---------------- Initial FX (after loader) ---------------- */
  var introChars = [];
  document.querySelectorAll(".anim-chars").forEach(function (el) {
    introChars.push(splitChars(el));
  });
  var upEl = document.querySelector(".anim-chars-up");
  var upChars = upEl ? splitChars(upEl) : null;
  if (upEl) upEl.querySelector(".split-line").classList.add("split-h2");

  function setHidden() {
    if (reduceMotion) return;
    introChars.forEach(function (chars) {
      gsap.set(chars, { y: 80, opacity: 0, filter: "blur(6px)" });
    });
    if (upChars) gsap.set(upChars, { yPercent: 110 });
    gsap.set(["#header", "#iconsSection"], { opacity: 0 });
    if (charImg) gsap.set(charImg, { opacity: 0, y: 60, scale: 1.03 });
  }
  setHidden();

  function initialFX() {
    document.body.classList.remove("loading");
    if (reduceMotion) {
      gsap.set(["#header", "#iconsSection"], { opacity: 1 });
      if (charImg) gsap.set(charImg, { opacity: 1, y: 0, scale: 1 });
      if (charModel) charModel.classList.add("character-loaded");
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (charImg) tl.to(charImg, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, 0.1);
    if (charModel) tl.add(function () { charModel.classList.add("character-loaded"); }, 0.15);
    introChars.forEach(function (chars, i) {
      tl.to(chars, {
        y: 0, opacity: 1, filter: "blur(0px)",
        duration: 0.85, stagger: 0.028
      }, 0.25 + i * 0.12);
    });
    if (upChars) {
      tl.to(upChars, { yPercent: 0, duration: 0.9, stagger: 0.03, ease: "power4.out" }, 0.6);
    }
    tl.to(["#header", "#iconsSection"], { opacity: 1, duration: 0.9 }, 0.9);
  }

  /* ---------------- Loading screen: percentage + Netflix-style zoom ---------------- */
  var loadingScreen = document.getElementById("loadingScreen");
  var loadingPercent = document.getElementById("loadingPercent");
  var loadingBarFill = document.getElementById("loadingBarFill");
  var loaderDone = false;
  var pageLoaded = document.readyState === "complete";
  // ready when the hero-critical assets are in (fonts + character image),
  // not when every icon on the page has finished
  Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(function (res) {
      var img = document.getElementById("characterImg");
      if (!img || img.complete) return res();
      img.addEventListener("load", res);
      img.addEventListener("error", res);
    })
  ]).then(function () { pageLoaded = true; });
  window.addEventListener("load", function () { pageLoaded = true; });
  setTimeout(function () { pageLoaded = true; }, 5000); // never hang on a slow asset

  (function runLoader() {
    if (!loadingScreen) { initialFX(); return; }
    var displayed = 0;
    var start = performance.now();
    function frame(now) {
      if (loaderDone || !document.body.contains(loadingScreen)) return;
      // ramp to 90 while assets load, then race to 100 once the page is ready
      // (minimum 1.4s on screen so the counter never just flashes past)
      var ramp = Math.min(90, Math.max(0, ((now - start) / 2200) * 90));
      var target = pageLoaded && now - start > 1400 ? 100 : ramp;
      displayed += (target - displayed) * 0.09;
      displayed = Math.max(0, displayed);
      if (target === 100 && target - displayed < 0.5) displayed = 100;
      var shown = Math.floor(displayed);
      if (loadingPercent) loadingPercent.innerHTML = shown + "<i>%</i>";
      if (loadingBarFill) loadingBarFill.style.transform = "scaleX(" + displayed / 100 + ")";
      if (displayed >= 100) { finishLoader(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  function finishLoader() {
    if (loaderDone) return;
    loaderDone = true;
    setTimeout(function () {
      if (loadingScreen) loadingScreen.classList.add("loading-zoom"); // name zooms toward the viewer
      setTimeout(function () {
        initialFX(); // homepage opens underneath as the zoom fades out
      }, 320);
      setTimeout(function () { if (loadingScreen) loadingScreen.remove(); }, 1400);
    }, 300);
  }

  if (!window.gsap || !window.ScrollTrigger) {
    // CDN failure fallback: show everything
    document.body.classList.remove("loading");
    if (loadingScreen) loadingScreen.remove();
    document.querySelectorAll(".career-info-box").forEach(function (b) { b.style.opacity = 1; });
    var wb = document.getElementById("whatBoxIn");
    if (wb) wb.style.display = "flex";
    return;
  }

  /* ---------------- Scroll: landing fade + character hand-off ---------------- */
  if (!reduceMotion) {
    gsap.to("#landingContainer", {
      y: "-14%", opacity: 0,
      scrollTrigger: { trigger: "#landingDiv", start: "top top", end: "bottom 40%", scrub: 1 }
    });
    if (charModel && isDesktop()) {
      // hand-off 1: slide the character to the left as About scrolls in
      gsap.to(charModel, {
        x: function () { return -window.innerWidth * 0.24; },
        scale: 0.97,
        ease: "none",
        scrollTrigger: { trigger: "#about", start: "top 90%", end: "top 15%", scrub: 1, invalidateOnRefresh: true }
      });
      // hand-off 2: fade the character away before the stats strip
      gsap.to(charModel, {
        autoAlpha: 0, y: 140,
        scrollTrigger: { trigger: "#stats", start: "top 130%", end: "top 70%", scrub: 1 }
      });
    }
    gsap.to("#navFade", {
      opacity: 1,
      scrollTrigger: { trigger: "#about", start: "top 80%", end: "top 40%", scrub: true }
    });
  } else {
    document.getElementById("navFade").style.opacity = 1;
  }

  /* ---------------- Section title / paragraph reveals ---------------- */
  document.querySelectorAll(".title").forEach(function (t) {
    var chars = splitChars(t);
    if (reduceMotion) return;
    gsap.fromTo(chars,
      { y: 80, rotate: 10, opacity: 0 },
      {
        y: 0, rotate: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.02,
        scrollTrigger: { trigger: t, start: "top 88%" }
      });
  });

  document.querySelectorAll(".para").forEach(function (p) {
    var words = splitWords(p);
    if (reduceMotion) return;
    gsap.fromTo(words,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.012,
        scrollTrigger: { trigger: p, start: "top 85%" }
      });
  });

  /* ---------------- Stats counters ---------------- */
  document.querySelectorAll(".stat-box").forEach(function (box, i) {
    var counter = box.querySelector(".counter");
    var target = parseInt(counter.getAttribute("data-target"), 10);
    if (reduceMotion) { counter.textContent = target; return; }
    gsap.fromTo(box, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, delay: i * 0.08, ease: "power3.out",
      scrollTrigger: { trigger: "#stats", start: "top 88%" }
    });
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, delay: 0.2 + i * 0.08, ease: "power2.out",
      snap: { v: 1 },
      onUpdate: function () { counter.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: "#stats", start: "top 88%" }
    });
  });

  /* ---------------- What I Do: re-arm entrance animations ---------------- */
  var whatBoxIn = document.getElementById("whatBoxIn");
  if (whatBoxIn) {
    ScrollTrigger.create({
      trigger: ".whatIDO",
      start: "top 75%",
      once: true,
      onEnter: function () { whatBoxIn.style.display = "flex"; }
    });
    // safety: if trigger never fires (e.g. anchor jump), show after 6s
    setTimeout(function () { whatBoxIn.style.display = "flex"; }, 6000);
  }
  // touch devices: tap to expand
  document.querySelectorAll(".what-content").forEach(function (c) {
    c.addEventListener("touchstart", function () {
      document.querySelectorAll(".what-content").forEach(function (o) {
        o.classList.remove("what-content-active");
        if (o !== c) o.classList.add("what-sibling"); else o.classList.remove("what-sibling");
      });
      c.classList.add("what-content-active");
    }, { passive: true });
  });

  /* ---------------- Career timeline ---------------- */
  var timeline = document.getElementById("careerTimeline");
  if (timeline && !reduceMotion) {
    gsap.fromTo(timeline, { maxHeight: "0%" }, {
      maxHeight: "100%", ease: "none",
      scrollTrigger: { trigger: ".career-info", start: "top 75%", end: "bottom 55%", scrub: 1 }
    });
  } else if (timeline) {
    timeline.style.maxHeight = "100%";
  }
  document.querySelectorAll(".career-info-box").forEach(function (box) {
    if (reduceMotion) { box.style.opacity = 1; return; }
    gsap.fromTo(box, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: box, start: "top 85%" }
    });
  });

  /* ---------------- Work: horizontal pinned scroll ---------------- */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 769px)", function () {
    if (reduceMotion) return;
    var flex = document.getElementById("workFlex");
    var getDistance = function () {
      var boxes = flex.querySelectorAll(".work-box");
      if (!boxes.length) return 0;
      var last = boxes[boxes.length - 1];
      var contentWidth = last.offsetLeft + last.offsetWidth; // transform-independent
      return Math.max(0, contentWidth - window.innerWidth + 160);
    };
    var tween = gsap.to(flex, {
      x: function () { return -getDistance(); },
      ease: "none",
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: function () { return "+=" + getDistance(); },
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
    return function () { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
  });

  /* ---------------- Achievements + generic card reveals ---------------- */
  if (!reduceMotion) {
    gsap.fromTo(".achievements-section h2", { y: 60, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ".achievements-section", start: "top 80%" }
    });
    document.querySelectorAll(".achievement-card").forEach(function (card, i) {
      gsap.fromTo(card, { y: 70, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, delay: i * 0.15, ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 88%" }
      });
    });
    gsap.fromTo(".techstack-content h2", { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: ".techstack-new", start: "top 75%" }
    });
    document.querySelectorAll(".techstack-row").forEach(function (row, i) {
      gsap.fromTo(row.children, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.03, delay: i * 0.1, ease: "power2.out",
        scrollTrigger: { trigger: ".techstack-pyramid", start: "top 82%" }
      });
    });
    gsap.fromTo(".career-section h2", { y: 60, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ".career-section", start: "top 78%" }
    });
    gsap.fromTo(".work-section h2", { y: 60, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ".work-section", start: "top 70%" }
    });
    gsap.fromTo(".contact-container", { y: 60, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ".contact-section", start: "top 80%" }
    });
  }

  /* ---------------- Refresh on images load ---------------- */
  window.addEventListener("load", function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
