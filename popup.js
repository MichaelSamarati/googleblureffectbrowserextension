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
const storageBlurModeName = "blurmode";
const storageCircleSizeName = "circlesize";

async function readFromStorage(name) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get("name", function (result) {
        resolve(result.name);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function writeToStorage(name, value) {
  chrome.storage.sync.set({ name: value });
}

async function readCurrentBlurModeFromStorage() {
  return await readFromStorage(storageBlurModeName);
}

async function readCircleSizeFromStorage() {
  return await readFromStorage(storageCircleSizeName);
}

function writeCurrentBlurModeToStorage(currentBlurMode) {
  writeToStorage(storageBlurModeName, currentBlurMode);
}

function writeCircleSizeToStorage(cirlceSize) {
  writeToStorage(storageCircleSizeName, cirlceSize);
}

run();

async function run() {
  const circleSizeSlider = document.getElementById("circle-size-slider");

  //Add to each blur mode button a onclick listener
  addClickListenersToBlurModeButtons(blurModeButtons);

  //Read current selected mode from storage
  const currentBlurMode = await readCurrentBlurModeFromStorage();

  //Set the style of the current selected blur mode button
  setBlurMode(currentBlurMode);
}

function addClickListenersToBlurModeButtons(blurModeButtons) {
  blurModeButtons.map((e) => {
    document.getElementById(e.buttonId).addEventListener("click", function () {
      setBlurMode(e.blurMode);
    });
  });
}

function setBlurMode(blurMode) {
  blurModeButtons.map((e) => {
    document
      .getElementById(e.buttonId)
      .classList.remove(selectedBlurModeButtonClass);
  });

  blurModeButtons.map((e) => {
    if (e.blurMode === blurMode) {
      document
        .getElementById(e.buttonId)
        .classList.add(selectedBlurModeButtonClass);
      writeCurrentBlurModeToStorage(blurMode);
      try {
        chrome.tabs.query(
          {
            active: true,
            currentWindow: true,
          },
          function (tabs) {
            var activeTab = tabs[0];
            let msg = { blurMode: blurMode };
            chrome.tabs.sendMessage(activeTab.id, msg);
          }
        );
      } catch (e) {}
    }
  });
}
