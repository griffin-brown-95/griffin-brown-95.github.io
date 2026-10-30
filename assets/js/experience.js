// Experience tabs: filter highlight cards by discipline, with a sliding tab underline
// and a staggered left-to-right wipe as cards come in. Each tab shows its first few
// cards; "Show all" reveals the rest.
(function () {
   var LIMIT = 4;
   var tabs = Array.prototype.slice.call(document.querySelectorAll(".xp-tab"));
   var cards = Array.prototype.slice.call(document.querySelectorAll(".xp-card"));
   var ink = document.querySelector(".xp-tab-ink");
   var more = document.querySelector(".xp-more");
   var moreBtn = more && more.querySelector("button");
   if (!tabs.length) return;
   var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
   var current = null;
   var expanded = false;

   function moveInk(tab) {
      if (!ink) return;
      ink.style.width = tab.offsetWidth + "px";
      ink.style.transform = "translateX(" + tab.offsetLeft + "px)";
   }

   function wipeIn(list) {
      if (reduceMotion.matches) return;
      list.forEach(function (card, i) {
         if (!card.animate) return;
         card.animate(
            [{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }, { clipPath: "inset(0 0 0 0)", opacity: 1 }],
            { duration: 520, delay: Math.min(i, 6) * 60, easing: "cubic-bezier(.77, 0, .18, 1)", fill: "backwards" }
         );
      });
   }

   function matches(card, key) {
      return (" " + card.dataset.tags + " ").indexOf(" " + key + " ") !== -1;
   }

   // Show the current tab's cards, capped unless expanded. Returns the cards that just appeared.
   function render() {
      var key = current.dataset.tab;
      var appeared = [];
      var n = 0;
      cards.forEach(function (card) {
         var show = matches(card, key) && (expanded || n < LIMIT);
         if (matches(card, key)) n++;
         if (show && card.hidden) appeared.push(card);
         card.hidden = !show;
      });
      if (more) {
         more.hidden = n <= LIMIT;
         moreBtn.textContent = expanded ? "Show fewer" : "Show all " + n;
         moreBtn.setAttribute("aria-expanded", expanded);
      }
      return appeared;
   }

   function select(tab, animate) {
      current = tab;
      expanded = false;
      tabs.forEach(function (t) {
         var on = t === tab;
         t.setAttribute("aria-selected", on);
         t.tabIndex = on ? 0 : -1;
      });
      moveInk(tab);
      cards.forEach(function (card) { card.hidden = true; });
      var appeared = render();
      if (animate) wipeIn(appeared);
   }

   tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, true); });
      tab.addEventListener("keydown", function (e) {
         var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
         if (!d) return;
         var next = tabs[(i + d + tabs.length) % tabs.length];
         next.focus();
         select(next, true);
      });
   });

   if (moreBtn) {
      moreBtn.addEventListener("click", function () {
         expanded = !expanded;
         var appeared = render();
         if (expanded) wipeIn(appeared);
         else document.getElementById("experience").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
      });
   }

   window.addEventListener("resize", function () { if (current) moveInk(current); });

   select(tabs[0], false);
})();

// Drawers (About, Timeline): slide in from the right; close with the ✕, Esc, or a click outside.
// A drawer with data-hash is linkable at /#<hash>, so nav links, Back and shared links work.
(function () {
   var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
   var EASE = "cubic-bezier(.2, .8, .2, 1)";
   var drawers = Array.prototype.slice.call(document.querySelectorAll(".drawer"));

   function byHash(hash) {
      return drawers.filter(function (d) { return d.dataset.hash && d.dataset.hash === hash; })[0];
   }

   function slide(d, opening) {
      var panel = d.querySelector(".drawer-panel");
      if (reduceMotion.matches || !panel.animate) return Promise.resolve();
      var frames = [{ transform: "translateX(100%)" }, { transform: "none" }];
      return panel.animate(opening ? frames : frames.reverse(), { duration: opening ? 420 : 300, easing: EASE }).finished;
   }

   function open(d) {
      if (d.open) return;
      d._opener = document.activeElement;
      d.showModal();
      d.querySelector(".drawer-panel").scrollTop = 0;
      slide(d, true);
   }

   function close(d) {
      if (!d.open || d._closing) return;
      d._closing = true;
      slide(d, false).then(function () {
         d.close();
         d._closing = false;
         if (d._opener && d._opener.focus) d._opener.focus({ preventScroll: true });
      });
   }

   // User actions go through the URL so Back closes what it opened.
   function show(d) {
      if (d.dataset.hash) history.pushState({ drawer: true }, "", "#" + d.dataset.hash);
      open(d);
   }

   function dismiss(d) {
      if (d.dataset.hash && location.hash === "#" + d.dataset.hash) {
         if (history.state && history.state.drawer) history.back();
         else { history.replaceState(null, "", location.pathname + location.search); close(d); }
      } else close(d);
   }

   function sync() {
      var target = byHash(decodeURIComponent(location.hash.slice(1)));
      drawers.forEach(function (d) { if (d !== target && d.dataset.hash) close(d); });
      if (target) open(target);
   }

   document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-drawer]");
      var link = !btn && e.target.closest("a[href*='#']");
      var d = btn ? document.getElementById(btn.dataset.drawer)
         : link && link.pathname === location.pathname ? byHash(link.hash.slice(1)) : null;
      if (!d || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      show(d);
   });

   drawers.forEach(function (d) {
      d.addEventListener("cancel", function (e) { e.preventDefault(); dismiss(d); });
      d.addEventListener("click", function (e) {
         // A click on the dialog itself (not the panel) is a click on the backdrop.
         if (e.target === d || e.target.closest("[data-drawer-close]")) dismiss(d);
      });
   });

   window.addEventListener("popstate", sync);
   window.addEventListener("hashchange", sync);
   if (location.hash) sync();
})();
