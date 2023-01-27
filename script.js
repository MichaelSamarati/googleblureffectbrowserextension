run();

function run() {
  const newDiv = document.createElement("div");
  newDiv.classList.add("random-background-image-normal-border");
  const mainElement = document.getElementsByClassName("L3eUgb")[0];

  mainElement.appendChild(newDiv);
  const imageNormalElement = document.getElementsByClassName(
    "random-background-image-normal"
  )[0];
  imageNormalElement.addEventListener("animationend", (e) =>
    startScaleAnimation(e)
  );
  function startScaleAnimation(e) {
    let time = "2000ms";
    newDiv.classList.add("no-click");
    // imageNormalElement.style.animation = "scale-animation";
    // imageNormalElement.style.animationDuration = time;
    // imageNormalElement.classList.add(".clip-path-animation");
    newDiv.style.animation = "scale-border-animation";
    newDiv.style.animationDuration = time;
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
  }
  // setInterval(() => {
  //   const imageNormalElement = document.getElementsByClassName("L3eUgb")[0];
  //   var rect = imageNormalElement.getBoundingClientRect();
  //   console.log(rect.top, rect.right, rect.bottom, rect.left);
  //   newDiv.style.left = rect.left + "px";
  //   newDiv.style.top = rect.top + "px";
  // }, 500);
}

function remove(element) {
  element.parentNode.removeChild(element);
}
