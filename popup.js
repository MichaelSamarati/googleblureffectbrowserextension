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

function run() {
  //Add to each blur mode button a onclick listener
  addClickListenersToBlurModeButtons(blurModeButtons);

  //Read current selected mode from localstorage
  const currentBlurMode = readCurrentBlurModeFromLocalStorage();

  //Set the style of the current selected blur mode button
  setBlurMode(currentBlurMode);

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      var activeTab = tabs[0];
      let msg = { phrase: currentBlurMode };
      chrome.tabs.sendMessage(activeTab.id, msg);
    }
  );
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
      writeCurrentBlurModeToLocalStorage(blurMode);
    }
  });
}
