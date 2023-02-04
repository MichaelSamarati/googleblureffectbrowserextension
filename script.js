const rectBlurMode = "rect";
const randomBlurMode = "random";
const mouseBlurMode = "mouse";
const disabledBlurMode = "disabled";
const defaultBlurMode = randomBlurMode;
const blurModeButtons = [
  {
    blurMode: rectBlurMode,
    buttonId: "rect-blur-mode-button",
  },
  {
    blurMode: randomBlurMode,
    buttonId: "random-blur-mode-button",
  },
  {
    blurMode: mouseBlurMode,
    buttonId: "mouse-blur-mode-button",
  },
  {
    blurMode: disabledBlurMode,
    buttonId: "disabled-blur-mode-button",
  },
];
const blurModeButtonClass = "blur-mode-button";
const selectedBlurModeButtonClass = "selected-blur-mode-button";
const localStorageBlurModeName = "blurmode";

function readCurrentBlurModeFromLocalStorage() {
  try {
    const currentBlurMode = window.localStorage.getItem(
      localStorageBlurModeName
    );
    return currentBlurMode;
  } catch (e) {
    console.log("readCurrentBlurModeFromLocalStorage error");
    return defaultBlurMode;
  }
}

function writeCurrentBlurModeToLocalStorage(currentBlurMode) {
  window.localStorage.setItem(localStorageBlurModeName, currentBlurMode);
}

run();
//TODO: make moving animation better by random location in a given rect without inner given rect;
//TODO: scale animation
//TODO: implement modes; rect; random; mouse over
//TODO: fix default nonblur elemnt size

var blurMode = "rect";

function run() {
  //get the google background element
  const mainElement = document.getElementsByClassName("L3eUgb")[0];
  //create an element that is the border of the non-blurred circle
  const nonBlurCircleBorderElement = document.createElement("div");
  nonBlurCircleBorderElement.classList.add(
    "random-background-image-normal-border"
  );
  //put the nonBlurCircleBorderElement on the DOM
  mainElement.appendChild(nonBlurCircleBorderElement);

  waitForElement(".random-background-image-normal").then(
    (nonBlurCircleElement) => {
      const currentBlurMode = readCurrentBlurModeFromLocalStorage();
      if (currentBlurMode === rectBlurMode) {
        nonBlurCircleElement.style.animationName = "move-animation";
        nonBlurCircleBorderElement.style.animationName =
          "move-border-animation";
      } else if (currentBlurMode === randomBlurMode) {
      } else if (currentBlurMode === mouseBlurMode) {
      } else if (currentBlurMode === disabledBlurMode) {
      } else {
      }
    }
  );
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

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {}

// const nonBlurCircleBorderElement = document.getElementsByClassName(
//   "random-background-image-normal-border"
// )[0];
// console.log(nonBlurCircleBorderElement);
// const nonBlurCircleElement = document.getElementsByClassName(
//   "random-background-image-normal"
// )[0];
// console.log(nonBlurCircleElement);
// setTimeout(console.log("adasda"), 50);
// const nonBlurCircleElement = document.getElementsByClassName(
//   "random-background-image-normal"
// )[0];
// console.log(nonBlurCircleElement);
// nonBlurCircleElement.style.animation = "move-animation";
// newDiv.style.animation = "move-border-animation";

// const imageNormalElement = document.getElementsByClassName(
//   "random-background-image-normal"
// )[0];
// imageNormalElement.addEventListener("animationend", (e) =>
//   startScaleAnimation(e)
// );
//function startScaleAnimation(e) {
/*this would start the aniation of scale but it is bugged
    let time = "2000ms";
    newDiv.classList.add("no-click");

    newDiv.style.animation = "scale-border-animation";
    newDiv.style.animationDuration = time;
    */
// imageNormalElement.style.animation = "scale-animation";
// imageNormalElement.style.animationDuration = time;
// imageNormalElement.classList.add(".clip-path-animation");
// imageNormalElement.style.animation = "scale-animation";
// imageNormalElement.style.animationDuration = time;
// let start = null;
// let end = 2000;
// let current = 10;
// function animate(timestamp) {
//   if (!start) start = timestamp;
//   let progress = timestamp - start;
//   // Update the radius
//   current = (end - 2000) * (progress / 2000) + 300;
//   imageNormalElement.style.clipPath = `circle(${current}px at center)`;
//   console.log(progress);
//   // Repeat the animation if it's not complete
//   if (progress < 2000) {
//     requestAnimationFrame(animate);
//   }
// }
// requestAnimationFrame(animate);
//}
// setInterval(() => {
//   const imageNormalElement = document.getElementsByClassName("L3eUgb")[0];
//   var rect = imageNormalElement.getBoundingClientRect();
//   console.log(rect.top, rect.right, rect.bottom, rect.left);
//   newDiv.style.left = rect.left + "px";
//   newDiv.style.top = rect.top + "px";
// }, 500);
//}

function remove(element) {
  element.parentNode.removeChild(element);
}
