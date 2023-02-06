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

async function readCurrentBlurModeFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get("localStorageBlurModeName", function (result) {
        resolve(result.localStorageBlurModeName);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function writeCurrentBlurModeToStorage(currentBlurMode) {
  chrome.storage.sync.set({ localStorageBlurModeName: currentBlurMode });
}

run();

async function run() {
  //Add to each blur mode button a onclick listener
  addClickListenersToBlurModeButtons(blurModeButtons);

  //Read current selected mode from localstorage
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
