export const isRunningStandalone: boolean = (function () {
  try {
    return window.matchMedia("(display-mode: standalone)").matches;
  } catch (e) {
    return false;
  }
})();
