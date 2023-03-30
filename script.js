const rectBlurMode = "rect";
const randomBlurMode = "random";
const mouseBlurMode = "mouse";
const disabledBlurMode = "disabled";
const defaultBlurMode = randomBlurMode;
const defaultColumns = 3;
const defaultBlur = 5;
const defaultCircleSize = 15;
const defaultBorderWidth = 6;
const randomImageUrl = "https://source.unsplash.com/random";

//TODO: reeadme guide how to use in chrome or link to how to use
//TODO: comment everwhere
//TODO: show with and without bloat remover
//TODO: blur 0px do black
//TODO: popup design
//TODO: if size 0px; then maybe no border ; and maybve different border sizes;
//TODO: Remove wait for element
//TODO: In viewport change size change update circle size blue effect:
//TODO: Fix default mode on no mode selected first time
//TODO:: kann man nicht body mouse listener mwschen
//TODO: add to filename soem string to be able top filter doiwnloadsfolder with string,
//TODO: line for movement mode; so just left right ight left in middle of scrrenen;
var listenToPopupMessages = false;
var modeHasChanged = false;
var lastAnimationId;
var backgroundImageUrl;
var columns = defaultColumns;
var blur = defaultBlur;
var circleSize = defaultCircleSize;
var borderWidth = defaultBorderWidth;
var blurMode;

run();

async function run() {
  //get the google background element
  const mainElement = document.getElementsByClassName("L3eUgb")[0];

  const backgroundImageUrl = await getRandomBackgroundImageUrl(randomImageUrl);
  setBackgroundImageUrl(backgroundImageUrl);

  listenToPopupMessages = true;

  //randomBackgroundImage stuff
  const randomBackgroundImageWrapper = document.createElement("div");
  randomBackgroundImageWrapper.classList.add("random-background-image-wrapper");
  randomBackgroundImageWrapper.classList.add("no-select");
  randomBackgroundImageWrapper.innerHTML =
    "<div class='random-background-image random-background-image-blur'></div>" +
    "<div class='random-background-image random-background-image-normal'></div>";
  mainElement.appendChild(randomBackgroundImageWrapper);

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
      const columnsFromStorage = await readColumnsFromStorage();
      updateColumns(columnsFromStorage);

      const blurFromStorage = await readBlurFromStorage();
      updateBlur(blurFromStorage);

      //setting circle size of non blurred circle and border element of it
      const circleSizeFromStorage = await readCircleSizeFromStorage();
      updateCircleSize(circleSizeFromStorage);

      //positioning elements in center just in case animations don't work
      const nonBlurCircleElementRect =
        nonBlurCircleElement.getBoundingClientRect();
      updateElementPositions(
        {
          x: nonBlurCircleElementRect.right / 2,
          y: nonBlurCircleElementRect.bottom / 2,
        },
        nonBlurCircleElement,
        nonBlurCircleBorderElement
      );

      const blurModeFromStorage = await readBlurModeFromStorage();
      executeMode(blurModeFromStorage);
    }
  );
}

async function getRandomBackgroundImageUrl(randomImageUrl) {
  const response = await fetch(randomImageUrl);
  return response.url;
}

function setBackgroundImageUrl(newBackgroundImageUrl) {
  backgroundImageUrl = newBackgroundImageUrl;
  const root = document.querySelector(":root");
  root.style.setProperty(
    "--background-image-url",
    `url(${backgroundImageUrl})`
  );
}

async function downloadBackgroundImage(imageSrc) {
  try {
    const image = await fetch(imageSrc);
    const imageBlob = await image.blob();
    const imageURL = URL.createObjectURL(imageBlob);
    const date = new Date();
    const fileName =
      fillWithLeadingZeros(date.getFullYear(), 4) +
      "" +
      fillWithLeadingZeros(date.getMonth() + 1, 2) +
      "" +
      fillWithLeadingZeros(date.getDate(), 2) +
      " " +
      fillWithLeadingZeros(date.getHours(), 2) +
      "-" +
      fillWithLeadingZeros(date.getMinutes(), 2) +
      "-" +
      fillWithLeadingZeros(date.getSeconds(), 2) +
      " Blur-Effect-Google-Chrome-Extension";
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.log("Image download failed!");
  }
}

function fillWithLeadingZeros(value, n) {
  return ("0" + value).slice(-n);
}

function updateBlur(newBlur) {
  if (!newBlur) {
    blur = defaultBlur;
  } else {
    blur = newBlur;
  }
  const blurredBackgroundElement = document.getElementsByClassName(
    "random-background-image-blur"
  )[0];
  blurredBackgroundElement.style.setProperty("--blur", `${blur}px`);
}

function updateColumns(newColumns) {
  if (!newColumns) {
    columns = defaultColumns;
  } else {
    columns = newColumns;
  }
  const root = document.querySelector(":root");
  root.style.setProperty("--background-size", `${100 / columns}%`);
}

function updateCircleSize(newCircleSize) {
  if (!newCircleSize) {
    circleSize = defaultCircleSize;
  } else {
    circleSize = newCircleSize;
  }

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

async function executeMode(newBlurMode) {
  if (blurMode !== newBlurMode) {
    modeHasChanged = true;
    blurMode = newBlurMode;
  } else {
    modeHasChanged = false;
    return;
  }
  if (!blurMode) {
    blurMode = defaultBlurMode;
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

async function writeColumnsToStorage(columns) {
  await chrome.storage.sync.set({ storagecolumnsname: columns });
}

async function writeBlurToStorage(blur) {
  await chrome.storage.sync.set({ storageblurname: blur });
}

async function writeCircleSizeToStorage(circleSize) {
  await chrome.storage.sync.set({ storagecirclesizename: circleSize });
}

async function writeBlurModeToStorage(blurMode) {
  await chrome.storage.sync.set({ storageblurmodename: blurMode });
}

async function writeColumnsToStorage(columns) {
  await chrome.storage.sync.set({ columns: columns });
}

async function writeBlurToStorage(blur) {
  await chrome.storage.sync.set({ blur: blur });
}

async function writeCircleSizeToStorage(circleSize) {
  await chrome.storage.sync.set({ circleSize: circleSize });
}

async function writeBlurModeToStorage(blurMode) {
  await chrome.storage.sync.set({ blurMode: blurMode });
}

async function readColumnsFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["columns"], function (result) {
        resolve(result.columns);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function readBlurFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["blur"], function (result) {
        resolve(result.blur);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function readCircleSizeFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["circleSize"], function (result) {
        resolve(result.circleSize);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function readBlurModeFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["blurMode"], function (result) {
        resolve(result.blurMode);
      });
    } catch (e) {
      reject(e);
    }
  });
}

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  if (listenToPopupMessages) {
    if (message.blur) {
      updateBlur(message.blur);
    }
    if (message.columns) {
      updateColumns(message.columns);
    }
    if (message.circleSize) {
      updateCircleSize(message.circleSize);
    }
    if (message.blurMode) {
      executeMode(message.blurMode);
    }
    if (message.download) {
      downloadBackgroundImage(backgroundImageUrl);
    }
  }
}
