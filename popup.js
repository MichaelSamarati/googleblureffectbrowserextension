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
const downloadButtonClass = "download-button";
const blurSliderClass = "blur-slider";
const blurButtonClass = "blur-button";
const circleSizeSliderClass = "circle-size-slider";
const circleSizeButtonClass = "circle-size-button";
const blurModeButtonClass = "blur-mode-button";
const selectedBlurModeButtonClass = "selected-blur-mode-button";
const defaultCircleSize = 15;
const defaultBlur = 5;
const defaultBorderWidth = 6;

async function writeBlurToStorage(blur) {
  await chrome.storage.sync.set({ storageblurname: blur });
}

async function writeCircleSizeToStorage(circleSize) {
  await chrome.storage.sync.set({ storagecirclesizename: circleSize });
}

async function writeBlurModeToStorage(blurMode) {
  await chrome.storage.sync.set({ storageblurmodename: blurMode });
}

async function readBlurFromStorage() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(["storageblurname"], function (result) {
        resolve(result.storageblurname);
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

async function readBlurModeFromStorage() {
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

run();

async function run() {
  const downloadButton = document.getElementById(downloadButtonClass);
  downloadButton.addEventListener("click", function (e) {
    downloadBackgroundImage();
  });

  const blurSlider = document.getElementById(blurSliderClass);
  blurSlider.addEventListener("change", function (e) {
    setBlur(e.target.value);
  });
  const blurButton = document.getElementById(blurButtonClass);
  blurButton.addEventListener("click", function (e) {
    setBlur(defaultBlur);
  });
  const currentBlur = await readBlurFromStorage();
  setBlur(currentBlur);

  const circleSizeSlider = document.getElementById(circleSizeSliderClass);
  circleSizeSlider.addEventListener("change", function (e) {
    setCircleSize(e.target.value);
  });
  const circleSizeButton = document.getElementById(circleSizeButtonClass);
  circleSizeButton.addEventListener("click", function (e) {
    setCircleSize(defaultCircleSize);
  });

  //Read circle size from storage
  const currentCircleSize = await readCircleSizeFromStorage();
  setCircleSize(currentCircleSize);

  //Add to each blur mode button a onclick listener
  addClickListenersToBlurModeButtons(blurModeButtons);

  //Read current selected mode from storage
  const currentBlurMode = await readBlurModeFromStorage();

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

function downloadBackgroundImage() {
  const msg = { download: "download" };
  sendToContentScript(msg);
}

function setBlur(blur) {
  if (!blur) {
    blur = defaultBlur;
  }
  const blurButton = document.getElementById(blurButtonClass);
  const blurSlider = document.getElementById(blurSliderClass);
  blurSlider.value = blur;
  blurButton.textContent = "Blur: " + blur + "px";
  writeBlurToStorage(blur);
  let msg = { blur: blur };
  sendToContentScript(msg);
}

function setCircleSize(circleSize) {
  if (!circleSize) {
    circleSize = defaultCircleSize;
  }
  const circleSizeButton = document.getElementById(circleSizeButtonClass);
  const circleSizeSlider = document.getElementById(circleSizeSliderClass);
  circleSizeSlider.value = circleSize;
  circleSizeButton.textContent = "Size: " + circleSize + "%";
  writeCircleSizeToStorage(circleSize);
  let msg = { circleSize: circleSize };
  sendToContentScript(msg);
}

function setBlurMode(blurMode) {
  if (!blurMode) {
    blurMode = defaultBlurMode;
  }
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
      writeBlurModeToStorage(blurMode);
      let msg = { blurMode: blurMode };
      sendToContentScript(msg);
    }
  });
}

function sendToContentScript(msg) {
  try {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      tabs.forEach((tab) => {
        try {
          chrome.tabs.sendMessage(tab.id, msg);
        } catch (e) {}
      })
    );
  } catch (e) {}
}
