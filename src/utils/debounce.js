export function debounce(fn, timeout) {
  let timeoutId = null;
  return function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(fn, timeout);
  };
}
