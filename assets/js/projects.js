// Project overlays: a colored wipe covers the screen, the project swaps in underneath,
// and the wipe sweeps off. Each project is linkable at /#<slug>; Back and Esc close it.
(function () {
   var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
   var EASE = "cubic-bezier(.77, 0, .18, 1)";
   var FULL = "inset(0 0 0 0)";
   var current = null;
   var busy = false;
   var returnFocus = null;

   function dialogFor(slug) {
      return slug ? document.getElementById("project-" + slug) : null;
   }

   function part(d, sel) { return d.querySelector(sel); }

   // Animate the wipe's clip-path and leave it at the end state.
   function clip(d, from, to, ms) {
      var wipe = part(d, ".dialog-wipe");
      wipe.style.clipPath = to;
      if (reduceMotion.matches || !wipe.animate) return Promise.resolve();
      return wipe.animate([{ clipPath: from }, { clipPath: to }], { duration: ms, easing: EASE }).finished;
   }

   // dir 1 sweeps left-to-right, -1 right-to-left.
   function cover(d, dir) {
      return clip(d, dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)", FULL, 420);
   }

   function uncover(d, dir) {
      return clip(d, FULL, dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", 480);
   }

   function showPanel(d, on) {
      part(d, ".dialog-panel").style.visibility = on ? "visible" : "hidden";
   }

   function settle(d) {
      var body = part(d, ".dialog-body");
      if (reduceMotion.matches || !body.animate) return;
      body.animate(
         [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
         { duration: 500, delay: 120, easing: "cubic-bezier(.2, .7, .2, 1)", fill: "backwards" }
      );
   }

   async function open(slug, dir) {
      var d = dialogFor(slug);
      if (!d || busy || d === current) return;
      busy = true;
      dir = dir || 1;

      if (current) {
         await cover(current, dir);
         current.close();
         part(d, ".dialog-wipe").style.clipPath = FULL;
         showPanel(d, true);
         d.showModal();
      } else {
         returnFocus = document.activeElement;
         showPanel(d, false);
         part(d, ".dialog-wipe").style.clipPath = "inset(0 100% 0 0)";
         d.showModal();
         await cover(d, dir);
         showPanel(d, true);
      }

      part(d, ".dialog-panel").scrollTop = 0;
      current = d;
      settle(d);
      await uncover(d, dir);
      busy = false;
   }

   async function close() {
      var d = current;
      if (!d || busy) return;
      busy = true;
      await cover(d, -1);
      showPanel(d, false);
      await uncover(d, -1);
      d.close();
      current = null;
      busy = false;
      if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
   }

   // ---- History: the hash is the source of truth ----
   function slugFromHash() {
      return decodeURIComponent(location.hash.slice(1));
   }

   function sync(dir) {
      var slug = slugFromHash();
      if (dialogFor(slug)) open(slug, dir);
      else if (current) close();
   }

   function navigate(slug, dir, replace) {
      if (busy) return;
      var url = "#" + slug;
      if (replace) history.replaceState({ project: true }, "", url);
      else history.pushState({ project: true }, "", url);
      open(slug, dir);
   }

   function requestClose() {
      if (busy) return;
      // If we opened it, step back so Back/Forward stay tidy; otherwise just drop the hash.
      if (history.state && history.state.project) history.back();
      else {
         history.replaceState(null, "", location.pathname + location.search);
         close();
      }
   }

   document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open]");
      if (opener) {
         if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
         e.preventDefault();
         // Moving between projects replaces history, so one Back returns to the page.
         navigate(opener.dataset.open, Number(opener.dataset.dir) || 1, !!current);
         return;
      }
      if (e.target.closest("[data-close]")) requestClose();
   });

   document.querySelectorAll(".project-dialog").forEach(function (d) {
      d.addEventListener("cancel", function (e) {
         e.preventDefault();
         requestClose();
      });
   });

   window.addEventListener("popstate", function () { sync(1); });
   window.addEventListener("hashchange", function () { sync(1); });

   // ---- Category filters ----
   var filters = document.querySelectorAll(".filter");
   filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
         var f = btn.dataset.filter;
         filters.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
         document.querySelectorAll(".index > li").forEach(function (li) {
            li.hidden = f !== "all" && li.dataset.category !== f;
         });
      });
   });

   if (slugFromHash()) sync(1);
})();
