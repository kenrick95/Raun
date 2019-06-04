export function debounce(fn, timeout, { maxDebounceCount }) {
  let timeoutId = null;
  let debounceCount = 0;
  return function(...args) {
    if (timeoutId) {
      if (maxDebounceCount != null) {
        if (debounceCount < maxDebounceCount) {
          debounceCount += 1;
          clearTimeout(timeoutId);
        } else {
          debounceCount = 0;
        }
      } else {
        clearTimeout(timeoutId);
      }
    }
    timeoutId = setTimeout(() => {
      fn.apply(null, args);
    }, timeout);
  };
}

export function splitArrayIntoChunks(array, size) {
  let chunkedArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArray.push(array.slice(i, i + size));
  }
  return chunkedArray;
}
