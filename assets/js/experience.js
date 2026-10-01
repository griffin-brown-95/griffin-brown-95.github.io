// Experience tabs: filter highlight cards by discipline, with a sliding tab underline
// and a staggered left-to-right wipe as the new cards come in.
(function () {
   var tabs = Array.prototype.slice.call(document.querySelectorAll(".xp-tab"));
   var cards = Array.prototype.slice.call(document.querySelectorAll(".xp-card"));
   var ink = document.querySelector(".xp-tab-ink");
   if (!tabs.length) return;
   var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

   function moveInk(tab) {
      if (!ink) return;
      ink.style.width = tab.offsetWidth + "px";
      ink.style.transform = "translateX(" + tab.offsetLeft + "px)";
   }

   function select(tab, animate) {
      var key = tab.dataset.tab;
      tabs.forEach(function (t) {
         var on = t === tab;
         t.setAttribute("aria-selected", on);
         t.tabIndex = on ? 0 : -1;
      });
      moveInk(tab);

      var shown = 0;
      cards.forEach(function (card) {
         var match = (" " + card.dataset.tags + " ").indexOf(" " + key + " ") !== -1;
         card.hidden = !match;
         if (!match || !animate || reduceMotion.matches || !card.animate) return;
         card.animate(
            [{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }, { clipPath: "inset(0 0 0 0)", opacity: 1 }],
            { duration: 520, delay: Math.min(shown, 6) * 60, easing: "cubic-bezier(.77, 0, .18, 1)", fill: "backwards" }
         );
         shown++;
      });
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

   window.addEventListener("resize", function () {
      var current = document.querySelector('.xp-tab[aria-selected="true"]');
      if (current) moveInk(current);
   });

   select(tabs[0], false);
})();
