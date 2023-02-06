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
const storageblurmodename = "blurmode";
const storagecirclesizename = "circlesize";
const defaultCircleSize = 15;
const defaultBorderWidth = 6;

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

run();

async function run() {
  const circleSizeSlider = document.getElementById("circle-size-slider");
  circleSizeSlider.addEventListener("change", function (e) {
    setCircleSize(e.target.value);
  });
  const circleSizeButton = document.getElementById("circle-size-button");
  circleSizeButton.addEventListener("click", function (e) {
    setCircleSize(defaultCircleSize);
  });
  //Read circle size from storage
  const currentCircleSize = await readCircleSizeFromStorage();
  setCircleSize(currentCircleSize);

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

function setCircleSize(circleSize) {
  const circleSizeButton = document.getElementById("circle-size-button");
  const circleSizeSlider = document.getElementById("circle-size-slider");
  circleSizeSlider.value = circleSize;
  circleSizeButton.textContent = "Size: " + circleSize + "%";
  writeCircleSizeToStorage(circleSize);
  try {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        var activeTab = tabs[0];
        let msg = { circleSize: circleSize };
        chrome.tabs.sendMessage(activeTab.id, msg);
      }
    );
  } catch (e) {}
}
