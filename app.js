(() => {
  "use strict";

  const data = window.COOKING_DATA;
  const storageKeys = {
    language: "danang-cooking-language",
    slide: "danang-cooking-slide",
  };

  const validLanguages = ["ko", "en", "vi"];
  const savedLanguage = localStorage.getItem(storageKeys.language);
  const savedSlide = Number.parseInt(localStorage.getItem(storageKeys.slide) || "0", 10);

  const state = {
    language: validLanguages.includes(savedLanguage) ? savedLanguage : "en",
    slide: Number.isFinite(savedSlide) ? Math.min(Math.max(savedSlide, 0), data.slides.length - 1) : 0,
    touchStartX: 0,
    touchStartY: 0,
    recipeOpen: false,
  };

  const elements = {
    html: document.documentElement,
    slide: document.getElementById("slide-live"),
    back: document.getElementById("back-button"),
    next: document.getElementById("next-button"),
    backLabel: document.getElementById("back-label"),
    nextLabel: document.getElementById("next-label"),
    progressLabel: document.getElementById("progress-label"),
    progressDots: document.getElementById("progress-dots"),
    langButtons: [...document.querySelectorAll("[data-lang]")],
    openRecipe: document.getElementById("open-recipe"),
    recipeTriggerLabel: document.getElementById("recipe-trigger-label"),
    recipePanel: document.getElementById("recipe-panel"),
    closeRecipe: document.getElementById("close-recipe"),
    recipeEyebrow: document.getElementById("recipe-eyebrow"),
    recipeTitle: document.getElementById("recipe-title"),
    recipeBody: document.getElementById("recipe-body"),
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function renderCover(slide, text) {
    return `
      <article class="slide cover-slide">
        <img class="cover-photo" src="${slide.image}" alt="Rabokki and Hwachae ready to serve" />
        <div class="cover-content">
          <span class="cover-kicker">${escapeHtml(text.kicker)}</span>
          <h1>${escapeHtml(text.title).replaceAll("\n", "<br>")}</h1>
          <p class="cover-foods">${escapeHtml(text.foods)}</p>
          <p class="cover-subtitle">${escapeHtml(text.subtitle)}</p>
        </div>
      </article>`;
  }

  function heading(text, step) {
    return `
      <header class="slide-heading">
        <div>
          <p class="eyebrow">${escapeHtml(text.eyebrow)}</p>
          <h1>${escapeHtml(text.title)}</h1>
        </div>
        <span class="step-stamp" aria-hidden="true">${step}</span>
      </header>`;
  }

  function renderSoak(slide, text) {
    return `
      <article class="slide">
        <div class="slide-inner">
          ${heading(text, 1)}
          <section class="content-card lesson-card">
            <div class="photo-wrap">
              <img class="photo" src="${slide.image}" alt="${escapeHtml(text.imageAlt)}" />
            </div>
            <div class="action-panel">
              <strong>${escapeHtml(text.action)}</strong>
              <p>${escapeHtml(text.detail)}</p>
              <span class="tiny-tip">→ ${escapeHtml(text.tip)}</span>
            </div>
          </section>
        </div>
      </article>`;
  }

  function renderCut(slide, text) {
    return `
      <article class="slide">
        <div class="slide-inner">
          ${heading(text, 2)}
          <section class="content-card ingredient-card">
            <div class="ingredient-photo">
              <img class="photo" src="${slide.image}" alt="${escapeHtml(text.imageAlt)}" />
              <div class="ingredient-labels">
                <span class="food-tag hwachae">HWACHAE</span>
                <span class="food-tag rabokki">RABOKKI</span>
              </div>
            </div>
            <div class="ingredient-footer">
              <div class="ingredient-group">
                <b>HWACHAE</b>
                <span>${escapeHtml(text.hwachae)}</span>
              </div>
              <div class="ingredient-group">
                <b>RABOKKI</b>
                <span>${escapeHtml(text.rabokki)}</span>
              </div>
            </div>
          </section>
          <div class="safety-line"><span class="warning">!</span><span>${escapeHtml(text.action)} · ${escapeHtml(text.safety)}</span></div>
        </div>
      </article>`;
  }

  function renderBoil(slide, text) {
    return `
      <article class="slide">
        <div class="slide-inner">
          ${heading(text, 3)}
          <div class="measure-strip" aria-label="${escapeHtml(text.water)} 500 grams plus ${escapeHtml(text.sauce)} 250 grams">
            <div class="measure-card"><span>${escapeHtml(text.water)}</span><strong>500 g</strong></div>
            <div class="measure-plus">+</div>
            <div class="measure-card sauce"><span>${escapeHtml(text.sauce)}</span><strong>250 g</strong></div>
          </div>
          <section class="content-card cook-card">
            <div class="cook-photo">
              <img class="photo" src="${slide.image}" alt="${escapeHtml(text.imageAlt)}" />
              <span class="cook-photo-label">${escapeHtml(text.imageLabel)}</span>
            </div>
            <ol class="process-list">${text.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </section>
          <div class="cook-note"><strong>!</strong><span>${escapeHtml(text.warning)}</span><span>→ ${escapeHtml(text.next)}</span></div>
        </div>
      </article>`;
  }

  function renderHwachae(slide, text) {
    return `
      <article class="slide">
        <div class="slide-inner">
          ${heading(text, 4)}
          <div class="ratio-card" aria-label="${escapeHtml(text.sprite)} 2 to ${escapeHtml(text.milk)} 1">
            <div class="ratio-side"><small>${escapeHtml(text.sprite)}</small><strong>2</strong></div>
            <span class="ratio-colon">:</span>
            <div class="ratio-side"><small>${escapeHtml(text.milk)}</small><strong>1</strong></div>
          </div>
          <section class="content-card hwachae-card">
            <div class="hwachae-photo"><img class="photo" src="${slide.image}" alt="${escapeHtml(text.imageAlt)}" /></div>
            <ol class="mini-steps">${text.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </section>
          <div class="optional-card">
            <span><b>${escapeHtml(text.optionalTitle)}</b> — ${escapeHtml(text.optional)}</span>
            <span class="optional-pill">OPTIONAL</span>
          </div>
        </div>
      </article>`;
  }

  function renderRamen(slide, text) {
    return `
      <article class="slide">
        <div class="slide-inner">
          ${heading(text, 5)}
          <section class="content-card ramen-card">
            <div class="ramen-photo">
              <img class="photo" src="${slide.image}" alt="${escapeHtml(text.imageAlt)}" />
              <span class="ramen-cue">${escapeHtml(text.cue)}</span>
            </div>
            <div class="ramen-instructions">
              <strong>${escapeHtml(text.action)}</strong>
              <p>${escapeHtml(text.detail)}</p>
            </div>
          </section>
        </div>
      </article>`;
  }

  function renderFinish(slide, text) {
    const ui = data.ui[state.language];
    return `
      <article class="slide finish-slide">
        <img class="cover-photo" src="${slide.image}" alt="Rabokki and Hwachae ready to serve" />
        <div class="finish-content">
          <span class="cover-kicker">${escapeHtml(text.kicker)}</span>
          <h1>${escapeHtml(text.title)}</h1>
          <div class="done-list"><span>Rabokki ✓</span><span>Hwachae ✓</span></div>
          <p class="culture-phrase" lang="ko">${escapeHtml(text.phrase)}</p>
          <p class="finish-translation">${escapeHtml(text.translation)}</p>
          <button class="start-over-inline" type="button" data-start-over>${escapeHtml(ui.startOver)}</button>
        </div>
      </article>`;
  }

  function renderSlide() {
    const slide = data.slides[state.slide];
    const text = slide[state.language];
    const renderers = {
      cover: renderCover,
      soak: renderSoak,
      cut: renderCut,
      boil: renderBoil,
      hwachae: renderHwachae,
      ramen: renderRamen,
      finish: renderFinish,
    };

    elements.slide.innerHTML = renderers[slide.type](slide, text);
    const startOver = elements.slide.querySelector("[data-start-over]");
    if (startOver) startOver.addEventListener("click", resetGuide);
  }

  function renderControls() {
    const ui = data.ui[state.language];
    const lastIndex = data.slides.length - 1;

    elements.html.lang = state.language;
    document.title = `${data.recipe[state.language].title} · ${ui.recipeTitle}`;
    elements.recipeTriggerLabel.textContent = ui.recipe;
    elements.backLabel.textContent = ui.back;
    elements.nextLabel.textContent = state.slide === lastIndex - 1 ? ui.finish : ui.next;
    elements.back.disabled = state.slide === 0;
    elements.next.disabled = state.slide === lastIndex;

    if (state.slide === 0) elements.progressLabel.textContent = ui.start;
    else if (state.slide === lastIndex) elements.progressLabel.textContent = ui.done;
    else elements.progressLabel.textContent = `${ui.step} ${state.slide} / 5`;

    elements.progressDots.innerHTML = data.slides
      .map((_, index) => `<i class="${index === state.slide ? "active" : ""}"></i>`)
      .join("");

    elements.langButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === state.language));
    });
  }

  function renderRecipe() {
    const ui = data.ui[state.language];
    const recipe = data.recipe[state.language];
    elements.recipeEyebrow.textContent = ui.recipeEyebrow;
    elements.recipeTitle.textContent = ui.recipeTitle;
    elements.closeRecipe.setAttribute("aria-label", ui.close);

    elements.recipeBody.innerHTML = `
      <div class="recipe-hero">
        <img src="./assets/step-6.webp" alt="Rabokki and Hwachae" />
        <div><h3>${escapeHtml(recipe.title)}</h3><p>${escapeHtml(recipe.subtitle)}</p></div>
      </div>
      <div class="recipe-metrics">
        ${recipe.metrics
          .map(([value, label]) => `<div class="recipe-metric"><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></div>`)
          .join("")}
      </div>
      ${recipe.sections
        .map(
          ([title, steps], index) => `
            <section class="recipe-section">
              <div class="recipe-section-heading"><span class="number">0${index + 1}</span><h3>${escapeHtml(title)}</h3></div>
              <ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
            </section>`,
        )
        .join("")}
      <div class="recipe-highlight">${escapeHtml(recipe.highlight)}</div>
      <button class="start-over-recipe" type="button" data-recipe-start-over>${escapeHtml(ui.startOver)}</button>`;

    elements.recipeBody.querySelector("[data-recipe-start-over]").addEventListener("click", () => {
      closeRecipe();
      resetGuide();
    });
  }

  function render() {
    renderSlide();
    renderControls();
    renderRecipe();
    localStorage.setItem(storageKeys.language, state.language);
    localStorage.setItem(storageKeys.slide, String(state.slide));
  }

  function goToSlide(nextSlide) {
    const clamped = Math.min(Math.max(nextSlide, 0), data.slides.length - 1);
    if (clamped === state.slide) return;
    state.slide = clamped;
    render();
  }

  function resetGuide() {
    state.slide = 0;
    render();
  }

  function openRecipe() {
    state.recipeOpen = true;
    elements.recipePanel.hidden = false;
    document.body.dataset.recipeOpen = "true";
    elements.closeRecipe.focus();
  }

  function closeRecipe() {
    state.recipeOpen = false;
    elements.recipePanel.hidden = true;
    delete document.body.dataset.recipeOpen;
    elements.openRecipe.focus();
  }

  elements.back.addEventListener("click", () => goToSlide(state.slide - 1));
  elements.next.addEventListener("click", () => goToSlide(state.slide + 1));
  elements.openRecipe.addEventListener("click", openRecipe);
  elements.closeRecipe.addEventListener("click", closeRecipe);
  elements.recipePanel.addEventListener("click", (event) => {
    if (event.target === elements.recipePanel) closeRecipe();
  });

  elements.langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.language = button.dataset.lang;
      render();
    });
  });

  elements.slide.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      state.touchStartX = touch.clientX;
      state.touchStartY = touch.clientY;
    },
    { passive: true },
  );

  elements.slide.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - state.touchStartX;
      const deltaY = touch.clientY - state.touchStartY;
      if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;
      goToSlide(state.slide + (deltaX < 0 ? 1 : -1));
    },
    { passive: true },
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.recipeOpen) closeRecipe();
    if (state.recipeOpen) return;
    if (event.key === "ArrowLeft") goToSlide(state.slide - 1);
    if (event.key === "ArrowRight") goToSlide(state.slide + 1);
  });

  data.slides.forEach((slide) => {
    const image = new Image();
    image.src = slide.image;
  });

  render();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
