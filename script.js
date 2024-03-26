const styleElement = document.createElement('style');
styleElement.textContent = `
    *{
  font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
.modal {
  top: var(--y, 50%);
  left: var(--x, 50%);
  background-color: white;
  position: absolute;
  transform: scale(var(--scale)) translate(var(--translate));
  border-radius: .25em;
  min-width: 200px;
  max-width: 250px;
  height: auto;
  z-index: 9001;
  opacity: 0;
  transition: 150ms ease-in-out;
  box-sizing: content-box;
  position: absolute;
  visibility: visible;
  background-color: #fff;
  min-width: 200px;
  border-radius: 5px;
  box-shadow: 0 3px 30px rgba(33,33,33,.3);
  transition: opacity .1s ease-out;
}

.modal.center {
  --translate: -50%, -50%;
  position: fixed;
  --y: 50% !important;
  --x: 50% !important;
}

.modal.show {
  --scale: 1;
  opacity: 1;
}

.modal .body,
.modal .title {
  padding: 0em 1em 1em 1em;
}

.modal .body{
  min-height: 50px;
}

.modal .title {
  font-size: 1.2em;
  font-weight: bold;
  width: -webkit-fill-available;
  padding: 1em;
}

.modal .footer {
  display: flex;
  justify-content: space-between;
  width: -webkit-fill-available;
  padding: 1em;
  border-top: 1px solid #e1e1e1;
}

.modal .footer button {
  cursor: pointer;
  box-sizing: content-box;
  position: relative;
  overflow: visible;
  padding: 0.5rem 1rem;
  border: 1px solid #bdbdbd;
  text-decoration: none;
  text-shadow: 1px 1px 0 #fff;
  font-size: 14px;
  color: #424242;
  white-space: nowrap;
  cursor: pointer;
  outline: 0;
  background-color: #f4f4f4;
  border-radius: 0.2em;
  zoom: 1;
  display: inline;
}

.modal .close-btn {
  position: absolute;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  transition: 150ms ease-in-out;
  font-weight: 900;
  top: 0;
  right: 0;
  display: inline-block;
  width: 45px;
  height: 45px;
  line-height: 45px;
  color: #616161;
  font-size: 1.5em;
  cursor: pointer;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.modal .close-btn:hover {
  color: black;
}

.highlight-container {
  border: .1em solid black;
  border-radius: .25em;
  box-shadow: 0 0 0 9999999px rgba(0, 0, 0, .3);
  z-index: 9000;
  position: absolute;
  transition: 250ms ease-in-out;
  transform: translate(-.25rem, -.25rem);
  pointer-events: none;
}

.highlight-container.hide {
  border: none;
}

`;
document.head.appendChild(styleElement);



class Modal {
  #modal;
  #nextBtn;
  #closeBtn;
  #backBtn;
  #body;
  #title;

  constructor(
    onBack,
    onNext,
    onClose,
    styles
  ) {
    this.#modal = document.createElement("div");
    this.#modal.classList.add("modal");
    this.#modal.setAttribute("style", styles.modalStyle);

    this.#closeBtn = document.createElement("button");
    this.#closeBtn.innerHTML = "&times;";
    this.#closeBtn.classList.add("close-btn");
    this.#closeBtn.setAttribute("style", styles.closeButtonStyle);
    this.#closeBtn.addEventListener("click", onClose);
    this.#modal.append(this.#closeBtn);

    this.#title = document.createElement("header");
    this.#title.classList.add("title");
    this.#title.setAttribute("style", styles.titleStyle);
    this.#modal.append(this.#title);

    this.#body = document.createElement("div");
    this.#body.classList.add("body");
    this.#body.setAttribute("style", styles.bodyStyle);
    this.#modal.append(this.#body);

    const footer = document.createElement("footer");
    footer.classList.add("footer");
    this.#modal.append(footer);

    this.#backBtn = document.createElement("button");
    this.#backBtn.textContent = "Back";
    this.#backBtn.addEventListener("click", onBack);
    this.#backBtn.setAttribute("style", styles.backBtnStyle);
    footer.append(this.#backBtn);

    this.#nextBtn = document.createElement("button");
    this.#nextBtn.textContent = "Next";
    this.#nextBtn.addEventListener("click", onNext);
    this.#nextBtn.setAttribute("style", styles.nextBtnStyle);
    footer.append(this.#nextBtn);

    document.body.append(this.#modal);
  }

  set title(value) {
    this.#title.innerText = value;
  }

  set body(value) {
    this.#body.innerText = value;
  }

  show(value = true) {
    this.#modal.classList.toggle("show", value);
  }

  center(value = true) {
    this.#modal.classList.toggle("center", value);
  }

  position({ bottom, left }) {
    const offset = ".5rem";
    this.#modal.style.setProperty(
      "--x",
      `calc(${left + window.scrollX}px + ${offset})`
    );
    this.#modal.style.setProperty(
      "--y",
      `calc(${bottom + window.scrollY}px + ${offset} + .25rem)`
    );
  }

  remove() {
    this.#modal.remove();
  }

  enableBackButton(enabled) {
    this.#backBtn.disabled = !enabled;
  }
}

class Intro {
  #modal;
  #highlightContainer;
  #bodyClick;

  constructor(steps) {
    this.steps = steps;
    this.#bodyClick = (e) => {
      if (
        e.target === this.#currentStep.element ||
        this.#currentStep.element?.contains(e.target) ||
        e.target.closest(".highlight-container") != null ||
        e.target.matches(".modal") ||
        e.target.closest(".modal") != null
      ) {
        return;
      }

      this.finish();
    };
  }

  start(styles) {
    this.currentStepIndex = 0;
    this.#modal = new Modal(
      () => {
        this.currentStepIndex--;
        this.#showCurrentStep();
      },
      () => {
        this.currentStepIndex++;
        if (this.currentStepIndex >= this.steps.length) {
          this.finish();
        } else {
          this.#showCurrentStep();
        }
      },
      () => this.finish(),
      styles
    );
    document.addEventListener("click", this.#bodyClick);
    this.#highlightContainer = this.#createHighlightContainer();
    this.#showCurrentStep();
  }

  finish() {
    document.removeEventListener("click", this.#bodyClick);
    this.#modal.remove();
    this.#highlightContainer.remove();
  }

  get #currentStep() {
    return this.steps[this.currentStepIndex];
  }

  #showCurrentStep() {
    this.#modal.show();
    this.#modal.enableBackButton(this.currentStepIndex !== 0);
    this.#modal.title = this.#currentStep.title;
    this.#modal.body = this.#currentStep.body;
    if (this.#currentStep.element == null) {
      this.#highlightContainer.classList.add("hide");
      this.#positionHighlightContainer({ x: 0, y: 0, width: 0, height: 0 });
      this.#modal.center();
    } else {
      this.#modal.center(false);
      const rect = this.#currentStep.element.getBoundingClientRect();
      this.#modal.position(rect);
      this.#highlightContainer.classList.remove("hide");
      this.#positionHighlightContainer(rect);
      this.#currentStep.element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }

  #createHighlightContainer() {
    const highlightContainer = document.createElement("div");
    highlightContainer.classList.add("highlight-container");
    document.body.append(highlightContainer);
    return highlightContainer;
  }

  #positionHighlightContainer(rect) {
    this.#highlightContainer.style.top = `${rect.top + window.scrollY}px`;
    this.#highlightContainer.style.left = `${rect.left + window.scrollX}px`;
    this.#highlightContainer.style.width = `${rect.width}px`;
    this.#highlightContainer.style.height = `${rect.height}px`;
  }
}

function getDataAttributes() {
  // Select all elements in the document
  const elements = document.querySelectorAll("*");

  // console.log(elements)
  // Convert NodeList to array and map to new array of objects
  const data = Array.from(elements).map((element) => {
    return {
      title: element.getAttribute("data-title"),
      body: element.getAttribute("data-body"),
      element: element,
    };
  });

  data.unshift({
    title: "Hi There!",
    body: "Welcome to Intro.js live demo! 👋",
  });
  // Filter out elements that don't have both data-title and data-body attributes
  const filteredData = data.filter(
    (item) => item.title !== null && item.body !== null
  );

  return filteredData;
}

function StepByStepJS(styles) {
  data = getDataAttributes();
  console.log(data);
  newData = new Intro(data);
  newData.start(styles);
}


StepByStepJS({
  modalStyle: "background-color: red;",
  closeButtonStyle: "color: green;",
  titleStyle: "background-color: blue; color: white",
  bodyStyle: "background-color: yellow; color: black",
  backBtnStyle: "background-color: green; color: black",
  nextBtnStyle: "background-color: blue; color: white",
});


modules.exports = StepByStepJS
// const intro = new Intro([
//   {
//     title: "Test Title",
//     body: "This is the body of the modal",
//   },
//   {
//     title: "Test Title 2",
//     body: "This is the body of the modal 2",
//     element: document.querySelector("[data-first]"),
//   },
//   {
//     title: "Test Title 3",
//     body: "This is the body of the modal 3",
//     element: document.querySelector("[data-second]"),
//   },
// ])
