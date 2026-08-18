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
    start: document.getElementById("start-button"),
    startLabel: document.getElementById("start-trigger-label"),
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
            <div class="action-panel step-description">
              <strong>${escapeHtml(text.action)}</strong>
              <p>${escapeHtml(text.detail)}</p>
              <span class="tiny-tip">→ ${escapeHtml(text.tip)}</span>
            </div>
          </section>
          <p class="soak-followup">${escapeHtml(text.followup)}</p>
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
            </div>
            <div class="ingredient-footer step-description">
              <div class="ingredient-group">
                <b>HWACHAE</b>
                <span>${escapeHtml(text.hwachae)}</span>
              </div>
              <div class="ingredient-group">
                <b>RABOKKI</b>
                <span>${escapeHtml(text.rabokki)}</span>
              </div>
              <p class="ingredient-action">${escapeHtml(text.action)}</p>
            </div>
          </section>
          <div class="safety-line step-note"><span class="warning">!</span><span>${escapeHtml(text.safety)}</span></div>
        </div>
      </article>`;
  }

  function renderBoil(slide, text) {
    return `
      <article class="slide">
        <div class="slide-inner">
          ${heading(text, 3)}
          <section class="content-card cook-card">
            <div class="cook-photo">
              <img class="photo" src="${slide.image}" alt="${escapeHtml(text.imageAlt)}" />
            </div>
            <ol class="process-list step-description">${text.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </section>
        </div>
      </article>`;
  }

  function renderHwachae(slide, text) {
    const iceGuide = data.settings.showIce
      ? `<div class="ice-card step-note"><span aria-hidden="true">❄</span><strong>${escapeHtml(text.ice)}</strong></div>`
      : "";

    return `
      <article class="slide">
        <div class="slide-inner">
          ${heading(text, 4)}
          <section class="content-card hwachae-card">
            <div class="hwachae-photo"><img class="photo" src="${slide.image}" alt="${escapeHtml(text.imageAlt)}" /></div>
            <ol class="mini-steps step-description">${text.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </section>
          <div class="optional-card step-note">
            <span><b>${escapeHtml(text.optionalTitle)}</b> — ${escapeHtml(text.optional)}</span>
            <span class="optional-pill">OPTIONAL</span>
          </div>
          ${iceGuide}
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
            </div>
            <div class="ramen-instructions step-description">
              <strong>${escapeHtml(text.action)}</strong>
              <p>${escapeHtml(text.cue)}</p>
            </div>
          </section>
        </div>
      </article>`;
  }

  function renderFinish(slide, text) {
    return `
      <article class="slide finish-slide">
        <img class="cover-photo" src="${slide.image}" alt="Rabokki and Hwachae ready to serve" />
        <div class="finish-content">
          <h1>${escapeHtml(text.title)}</h1>
          <div class="done-list"><span>Rabokki ✓</span><span>Hwachae ✓</span></div>
          <p class="culture-phrase" lang="ko">${escapeHtml(text.phrase)}</p>
          <p class="finish-translation">${escapeHtml(text.translation)}</p>
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
  }

  function renderControls() {
    const ui = data.ui[state.language];
    const lastIndex = data.slides.length - 1;

    elements.html.lang = state.language;
    document.title = `${data.recipe[state.language].title} · ${ui.recipeTitle}`;
    elements.startLabel.textContent = ui.home;
    elements.start.disabled = state.slide === 0;
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
      ${recipe.foods
        .map(
          (food) => `
            <section class="recipe-food recipe-food-${escapeHtml(food.id)}">
              <header class="recipe-food-header">
                <div>
                  <span>${escapeHtml(recipe.serving)}</span>
                  <h3>${escapeHtml(food.title)}</h3>
                </div>
              </header>

              <div class="recipe-ingredients">
                <h4>${escapeHtml(recipe.ingredientsTitle)}</h4>
                <dl>
                  ${food.ingredients
                    .map(
                      ([ingredient, amount]) => `
                        <div>
                          <dt>${escapeHtml(ingredient)}</dt>
                          <dd>${escapeHtml(amount)}</dd>
                        </div>`,
                    )
                    .join("")}
                </dl>
              </div>

              ${
                food.ratio
                  ? `<div class="recipe-ratio"><span>${escapeHtml(recipe.ratioTitle)}</span><strong>${escapeHtml(food.ratio)}</strong></div>`
                  : ""
              }
              ${food.note ? `<p class="recipe-note">${escapeHtml(food.note)}</p>` : ""}

              <div class="recipe-method">
                <h4>${escapeHtml(recipe.methodTitle)}</h4>
                <ol>${food.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
              </div>
            </section>`,
        )
        .join("")}
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

  elements.start.addEventListener("click", resetGuide);
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
