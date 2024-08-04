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
const columnsSliderClass = "columns-slider";
const columnsButtonClass = "columns-button";
const blurSliderClass = "blur-slider";
const blurButtonClass = "blur-button";
const circleSizeSliderClass = "circle-size-slider";
const circleSizeButtonClass = "circle-size-button";
const blurModeButtonClass = "blur-mode-button";
const selectedBlurModeButtonClass = "selected-blur-mode-button";
const defaultColumns = 3;
const defaultBlur = 5;
const defaultCircleSize = 15;
const defaultBorderWidth = 6;

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

run();

async function run() {
  const columnsSlider = document.getElementById(columnsSliderClass);
  columnsSlider.addEventListener("change", function (e) {
    setColumns(e.target.value);
  });
  const columnsButton = document.getElementById(columnsButtonClass);
  columnsButton.addEventListener("click", function (e) {
    setColumns(defaultColumns);
  });
  const currentColumns = await readColumnsFromStorage();
  setColumns(currentColumns);

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

function setColumns(columns) {
  if (!columns) {
    columns = defaultColumns;
  }
  const columnsSlider = document.getElementById(columnsSliderClass);
  const columnsButton = document.getElementById(columnsButtonClass);
  columnsSlider.value = columns;
  columnsButton.textContent = "Columns: " + columns;
  writeColumnsToStorage(columns);
  sendToContentScript({ columns: columns });
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
  sendToContentScript({ blur: blur });
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
  sendToContentScript({ circleSize: circleSize });
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
      sendToContentScript({ blurMode: blurMode });
    }
  });
}

function sendToContentScript(msg) {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
      tabs.forEach((tab) => {
        try {
          chrome.tabs.sendMessage(tab.id, msg);
        } catch (e) {}
      })
    );
  } catch (e) {}
}
