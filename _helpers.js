const el = (type = null, props = {}, ...children) => {
  // Return, no type declared.
  if (!type) {
    return console.error("Provide `type` to create document element.");
  }

  // Create element with optional attribute props
  const docEl = Object.assign(document.createElement(type), props);

  // Children: array containing strings or elements
  children.forEach((child) => {
    if (typeof child === "string") {
      docEl.appendChild(document.createTextNode(child));
    } else if (Array.isArray(child)) {
      child.forEach((c) => docEl.appendChild(c));
    } else {
      docEl.appendChild(child);
    }
  });

  return docEl;
};

// https://davidwalsh.name/javascript-debounce-function
// debouncing so we don't penilize fast typers with to many dom refresh
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function reverseIndex(startIndex) {
  const numArr = startIndex.toString().split("");
  const lastNum = Number(numArr[numArr.length - 1]);
  const firstNum = Number(numArr.slice(0, -1).join(""));
  return firstNum + lastNum;
}
