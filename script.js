const rectBlurMode = "rect";
const randomBlurMode = "random";
const mouseBlurMode = "mouse";
const disabledBlurMode = "disabled";
const defaultBlurMode = randomBlurMode;
const blurModeButtonClass = "blur-mode-button";
const selectedBlurModeButtonClass = "selected-blur-mode-button";
const storageblurmodename = "blurmode";
const storagecirclesizename = "circlesize";
const defaultCircleSize = 15;
const defaultBorderWidth = 6;

//TODO: Blur pixel
//TODO: save picture at randm piucture extension
//TODO: set at start border to leemnt or both at point so insured the same;
//TODO: button hover color

var modeHasChanged = false;
var currentBlurMode;
var lastAnimationId;
var circleSize = defaultCircleSize;
var borderWidth = defaultBorderWidth;

run();

function run() {
  //get the google background element
  const mainElement = document.getElementsByClassName("L3eUgb")[0];
  //create an element that is the border of the non-blurred circle
  const nonBlurCircleBorderElement = document.createElement("div");
  nonBlurCircleBorderElement.classList.add(
    "random-background-image-normal-border"
  );
  nonBlurCircleBorderElement.classList.add("no-select");

  //create absolute element for mouse listener in case of mouse mode
  const mouseListenerArea = document.createElement("div");
  mouseListenerArea.classList.add("mouse-listener-area");

  //put the nonBlurCircleBorderElement on the DOM
  mainElement.appendChild(nonBlurCircleBorderElement);
  mainElement.appendChild(mouseListenerArea);

  //wait for non-blurred circle and afterwards start moving animation, so that the animations are in sync
  waitForElement(".random-background-image-normal").then(
    async (nonBlurCircleElement) => {
      //setting circle size of non blurred circle and border element of it
      updateCircleSize(circleSize);

      //positioning elements in center just in case animations don't work
      nonBlurCircleBorderElement.style.top = `calc(50% - ${
        circleSize / 2 + borderWidth
      }px)`;
      nonBlurCircleBorderElement.style.left = `calc(50% - ${
        circleSize / 2 + borderWidth
      }px)`;

      const blurModeFromStorage = await readCurrentBlurModeFromStorage();
      executeMode(blurModeFromStorage);
    }
  );
}

function updateCircleSize(newCircleSize) {
  //update new circle sizes
  circleSize = newCircleSize;

  //get necessary elements
  const nonBlurCircleElement = document.getElementsByClassName(
    "random-background-image-normal"
  )[0];
  const nonBlurCircleBorderElement = document.getElementsByClassName(
    "random-background-image-normal-border"
  )[0];

  //get new absolute size
  const nonBlurCircleElementRect = nonBlurCircleElement.getBoundingClientRect();
  const width = nonBlurCircleElementRect.right;
  const height = nonBlurCircleElementRect.bottom;
  const largerDimension = Math.max(width, height);
  const diameter = (largerDimension * circleSize) / 100;

  //update element sizes
  nonBlurCircleElement.style.setProperty("--radius", `${diameter / 2}px`);
  nonBlurCircleBorderElement.style.setProperty("--size", `${diameter}px`);
  nonBlurCircleBorderElement.style.setProperty(
    "--border-width",
    `${borderWidth}px`
  );
}

async function executeMode(blurMode) {
  if (blurMode !== currentBlurMode) {
    modeHasChanged = true;
    currentBlurMode = blurMode;
  } else {
    modeHasChanged = false;
    return;
  }

  //get necessary elements
  const nonBlurCircleElement = document.getElementsByClassName(
    "random-background-image-normal"
  )[0];
  const nonBlurCircleBorderElement = document.getElementsByClassName(
    "random-background-image-normal-border"
  )[0];
  const mouseListenerArea = document.getElementsByClassName(
    "mouse-listener-area"
  )[0];

  //set border of circle back to top left so animations work
  nonBlurCircleBorderElement.style.top = "0";
  nonBlurCircleBorderElement.style.left = "0";

  //clean up stuff from old modes
  //rect and random clean up
  if (lastAnimationId) {
    cancelAnimationFrame(lastAnimationId);
  }
  //mouse mode clean up
  document.body.style.cursor = "auto";
  mouseListenerArea.removeEventListener(
    "mousemove",
    mouseBlurModeEventListener
  );
  //disabled mode clean up
  nonBlurCircleElement.style.clipPath = "";
  nonBlurCircleBorderElement.style.display = "block";

  //move circle depending on mode
  if (blurMode === rectBlurMode) {
    const getNewPosition = (oldPosition, xMin, xMax, yMin, yMax) => {
      return getNextRectPosition(oldPosition, xMin, xMax, yMin, yMax);
    };
    animateMovement(
      nonBlurCircleElement,
      nonBlurCircleBorderElement,
      getNewPosition
    );
  } else if (blurMode === randomBlurMode) {
    const getNewPosition = (oldPosition, xMin, nxMax, yMin, yMax) => {
      return getRandomPosition(
        0,
        nonBlurCircleElement.getBoundingClientRect().right,
        0,
        nonBlurCircleElement.getBoundingClientRect().bottom
      );
    };
    animateMovement(
      nonBlurCircleElement,
      nonBlurCircleBorderElement,
      getNewPosition
    );
  } else if (blurMode === mouseBlurMode) {
    document.body.style.cursor = "none";
    mouseListenerArea.addEventListener("mousemove", mouseBlurModeEventListener);
    function mouseBlurModeEventListener({ offsetX, offsetY }) {
      updateElementPositions(
        { x: offsetX, y: offsetY },
        nonBlurCircleElement,
        nonBlurCircleBorderElement
      );
    }
  } else if (blurMode === disabledBlurMode) {
    //hide blurred image and border of it
    nonBlurCircleElement.style.clipPath = "circle(100% at center)";
    nonBlurCircleBorderElement.style.display = "none";
  }
}

function animateMovement(
  nonBlurCircleElement,
  nonBlurCircleBorderElement,
  getNewPosition
) {
  const distanceForOneSecond = 600;
  let nonBlurCircleElementRect = nonBlurCircleElement.getBoundingClientRect();
  let nonBlurCircleElementWidth = nonBlurCircleElementRect.right;
  let nonBlurCircleElementHeight = nonBlurCircleElementRect.bottom;

  let marginX = 0.17 * nonBlurCircleElementWidth;
  let marginY = 0.21 * nonBlurCircleElementHeight;
  let xMin = marginX;
  let xMax = nonBlurCircleElementWidth - marginX;
  let yMin = marginY;
  let yMax = nonBlurCircleElementHeight - marginY;

  let sourcePosition = getNewPosition(null, xMin, xMax, yMin, yMax);
  let destinationPosition = getNewPosition(
    sourcePosition,
    xMin,
    xMax,
    yMin,
    yMax
  );
  let start = null;
  let distance = Math.sqrt(
    Math.pow(destinationPosition.x - sourcePosition.x, 2) +
      Math.pow(destinationPosition.y - sourcePosition.y, 2)
  );
  let duration = (distance / distanceForOneSecond) * 1000;
  modeHasChanged = false;
  lastAnimationId = requestAnimationFrame(animate);
  function animate(timestamp) {
    if (modeHasChanged) {
      //rect and random clean up
      if (lastAnimationId) {
        cancelAnimationFrame(lastAnimationId);
      }
      modeHasChanged = false;
      return;
    }
    if (!start) start = timestamp;
    let diff = timestamp - start;
    let progress = diff / duration;
    let currentPosition = calculateNewPosition(
      progress,
      sourcePosition,
      destinationPosition
    );
    nonBlurCircleElementRect = nonBlurCircleElement.getBoundingClientRect();
    nonBlurCircleElementWidth = nonBlurCircleElementRect.right;
    nonBlurCircleElementHeight = nonBlurCircleElementRect.bottom;
    marginX = 0.17 * nonBlurCircleElementWidth;
    marginY = 0.21 * nonBlurCircleElementHeight;
    xMin = marginX;
    xMax = nonBlurCircleElementWidth - marginX;
    yMin = marginY;
    yMax = nonBlurCircleElementHeight - marginY;
    updateElementPositions(
      currentPosition,
      nonBlurCircleElement,
      nonBlurCircleBorderElement
    );
    if (diff >= duration) {
      start = null;
      sourcePosition = destinationPosition;
      destinationPosition = getNewPosition(
        sourcePosition,
        xMin,
        xMax,
        yMin,
        yMax
      );
      distance = Math.sqrt(
        Math.pow(destinationPosition.x - sourcePosition.x, 2) +
          Math.pow(destinationPosition.y - sourcePosition.y, 2)
      );
      duration = (distance / distanceForOneSecond) * 1000;
    }
    lastAnimationId = requestAnimationFrame(animate);
  }
}

function updateElementPositions(
  currentPosition,
  nonBlurCircleElement,
  nonBlurCircleBorderElement
) {
  nonBlurCircleElement.style.setProperty("--x", `${currentPosition.x}px`);
  nonBlurCircleElement.style.setProperty("--y", `${currentPosition.y}px`);
  nonBlurCircleBorderElement.style.setProperty("--x", `${currentPosition.x}px`);
  nonBlurCircleBorderElement.style.setProperty("--y", `${currentPosition.y}px`);
}

function calculateNewPosition(progress, sourcePosition, destinationPosition) {
  let newX =
    easeInOutQuad(progress) * (destinationPosition.x - sourcePosition.x) +
    sourcePosition.x;
  let newY =
    easeInOutQuad(progress) * (destinationPosition.y - sourcePosition.y) +
    sourcePosition.y;
  return { x: newX, y: newY };
}

function getNextRectPosition(oldPosition, xMin, xMax, yMin, yMax) {
  if (!oldPosition) {
    return { x: xMin, y: yMin };
  }
  if (oldPosition.x === xMin && oldPosition.y === yMin) {
    return { x: xMax, y: yMin };
  }
  if (oldPosition.x === xMax && oldPosition.y === yMin) {
    return { x: xMax, y: yMax };
  }
  if (oldPosition.x === xMax && oldPosition.y === yMax) {
    return { x: xMin, y: yMax };
  }
  if (oldPosition.x === xMin && oldPosition.y === yMax) {
    return { x: xMin, y: yMin };
  }
  return { x: xMin, y: yMin };
}

function getRandomPosition(xMin, xMax, yMin, yMax) {
  let x = getRandomValue(xMin, xMax);
  let y = getRandomValue(yMin, yMax);
  return { x, y };
}

function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

async function readCurrentBlurModeFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["storageblurmodename"], function (result) {
        resolve(result.storageblurmodename);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function readCircleSizeFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["storagecirclesizename"], function (result) {
        resolve(result.storagecirclesizename);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function writeCurrentBlurModeToStorage(currentBlurMode) {
  await chrome.storage.sync.set({ storageblurmodename: currentBlurMode });
}

async function writeCircleSizeToStorage(circleSize) {
  await chrome.storage.sync.set({ storagecirclesizename: circleSize });
}

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  if (message.blurMode) {
    executeMode(message.blurMode);
  }
  if (message.circleSize) {
    updateCircleSize(message.circleSize);
  }
}
