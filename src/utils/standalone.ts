export const IsStandaloneMediaQuery = "(display-mode: standalone)";

export const isRunningStandalone: boolean = (function () {
  try {
    return window.matchMedia(IsStandaloneMediaQuery).matches;
  } catch (e) {
    return false;
  }
})();

export function reloadAppIfStandaloneModeChanges() {
  const mql = window.matchMedia(IsStandaloneMediaQuery);
  mql.onchange = () => {
    window.location.reload();
  };
}
