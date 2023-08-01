/**
 * Here is how to use the web component "pan-n-zoom-present":
 *
 *    <pan-n-zoom-present [...attributes]></pan-n-zoom>
 *
 * Required attributes:
 *    - config: Base64(JSON.stringify({ project: {...projectData}, imageDataUrl: "data:..." }))
 *
 * Optional attributes:
 *    - data-debug: empty or string – If present, it enables debug logs.
 *    - data-autoplay: string - "true" or "false" > "false" has the same effect like when this attribute is missing.
 *    - data-autoplay-delay: number - Autoplay delay time in milliseconds.
 *    - data-loop: string - "true" or "false" > If "true" lets you jump across the first/last slide.
 *    - data-theme: string – One of the following values: system, light, dark (default = system)
 *    - data-canvas-aspect-ratio: string – CSS aspect ratio (e.g. "16/9")
 *    - data-canvas-max-height: string - CSS max-height value (e.g. 500px)
 *    - data-rounded: empty or string - CSS border-radius (examples: 'data-rounded' (uses default 8px), 'data-rounded="24px"')
 *    - data-hide-title: boolean "true" or "false" (same as missing attribute)
 *    - data-hide-branding: boolean "true" or "false" (same as missing attribute)
 *    - data-hide-image-download: boolean "true" or "false" (same as missing attribute)
 *    - data-hide-export-download: boolean "true" or "false" (same as missing attribute)
 *    - data-show-copy-link-to-viewer: boolean "true" or "false" (same as missing attribute)
 *
 * How to control size:
 *    - either set 'style="height: 600px;"' and the presentation canvas will take up the assigned width (minus the controls height)
 *    - ... or use
 *      - "canvasAspectRatio" (height implicitly defined by available width and aspect ratio)
 *      - "canvasMaxHeight" (will be used as height)
 *      - "canvasAspectRatio" and "canvasMaxHeight" (aspect ratio is used, but up to the specified max height)
 */

const PanNZoomPresentWebComponentTag = "pan-n-zoom-present";

if (!window.customElements.get(PanNZoomPresentWebComponentTag)) {
  class PanNZoom extends HTMLElement {
    constructor() {
      super();
      this.log(
        "<pan-n-zoom-present> tag has been created. Waiting for connect...",
      );
    }

    connectedCallback() {
      this.log("<pan-n-zoom-present> tag has been connected. Initializing...");

      this.enableDebugLogs = this.getDatasetBoolean("debug", false);
      this.loopEnabled = this.getDatasetBoolean("loop", false);
      this.autoplayEnabled = this.getDatasetBoolean("autoplay", false);
      this.hideTitle = this.getDatasetBoolean("hideTitle", false);
      this.hideBranding = this.getDatasetBoolean("hideBranding", false);
      this.showCopyLinkToViewer = this.getDatasetBoolean(
        "showCopyLinkToViewer",
        false,
      );
      this.hideImageDownload = this.getDatasetBoolean(
        "hideImageDownload",
        false,
      );
      this.hideExportDownload = this.getDatasetBoolean(
        "hideExportDownload",
        false,
      );

      this.theme = ["system", "light", "dark"].includes(this.dataset.theme)
        ? this.dataset.theme
        : "system";
      this.autoplayDelay = parseInt(this.dataset.autoplayDelay ?? "2000");
      this.borderRadius = !this.dataset.rounded
        ? "0px"
        : this.dataset.rounded.length === 0
        ? "8px"
        : this.dataset.rounded;

      this.layout = null;
      this.header = null;
      this.headerLeft = null;
      this.headerCenter = null;
      this.headerRight = null;
      this.headerTitle = null;
      this.headerBranding = null;
      this.headerShare = null;
      this.headerShareButton = null;
      this.headerSharePopup = null;
      this.headerCopyLinkToViewerOption = null;
      this.headerDownloadImageOption = null;
      this.headerDownloadExportOption = null;
      this.wrapper = null;
      this.controls = null;
      this.firstButton = null;
      this.previousButton = null;
      this.keyframeInfo = null;
      this.nextButton = null;
      this.lastButton = null;
      this.export = null;
      this.image = null;
      this.wrapperWidth = 0;
      this.wrapperHeight = 0;
      this.imageNaturalWidth = 0;
      this.imageNaturalHeight = 0;
      this.currentKeyframeIndex = null;
      this.currentKeyframe = null;
      this.canPrevious = false;
      this.canNext = false;
      this.autoplayTimeout = null;

      this.log("Creating shadow DOM...");
      this.attachShadow({ mode: "open" });
      this.log("Created shadow DOM successfully ✅");

      this.initStyles();
      this.createLayout();
      this.createHeader();
      this.createWrapper();
      this.createControls();

      void this.readAndDecodeConfig()
        .then(() => {
          this.applyStyleConfigs();
          this.applyHeaderConfigs();
        })
        .then(async () => {
          await this.createImage();
        })
        .then(() => {
          this.setKeyframe(this.export.project.keyframes[0].id);
          this.startWrapperResizeTracking();
          setTimeout(() => {
            this.applyTransitionConfigs();
            this.autoplayTick(true);
          }, 150);
        });
    }

    getDatasetBoolean(name, defaultValue) {
      const value = (this.dataset[name] ?? "").toLowerCase();
      return value === "true" ? true : value === "false" ? false : defaultValue;
    }

    autoplayTick(isFirst) {
      if (this.autoplayEnabled) {
        this.log(
          `Autoplay enabled > tick (isFirst = ${isFirst}, delay = ${this.autoplayDelay})`,
        );

        if (this.autoplayTimeout) {
          this.log(`Clearing old autoplay timeout.`);
          clearTimeout(this.autoplayTimeout);
          this.autoplayTimeout = null;
        }

        if (this.canNext) {
          this.log(`canNext = true > scheduling nextKeyframe() and next tick.`);

          this.autoplayTimeout = setTimeout(
            () => {
              this.log(`Autoplay executing nextKeyframe()...`);
              this.autoplayTimeout = null;
              this.nextKeyframe();
              this.autoplayTick();
            },
            this.autoplayDelay +
              (isFirst ? 0 : this.export.project.animationDuration),
          );
        }
      }
    }

    firstKeyframe() {
      if (this.canPrevious) {
        this.setKeyframe(0);
      }
    }

    lastKeyframe() {
      if (this.canNext) {
        this.setKeyframe(this.export.project.keyframes.length - 1);
      }
    }

    nextKeyframe() {
      if (this.canNext) {
        this.setKeyframe(
          (this.currentKeyframeIndex + 1) %
            this.export.project.keyframes.length,
        );
      }
    }

    previousKeyframe() {
      if (this.canPrevious) {
        this.setKeyframe(
          this.currentKeyframeIndex === 0
            ? this.export.project.keyframes.length - 1
            : this.currentKeyframeIndex - 1,
        );
      }
    }

    setKeyframe(keyframeIndex) {
      this.log(`Set keyframe index to = ${keyframeIndex}`);

      this.currentKeyframeIndex = keyframeIndex;

      if (
        keyframeIndex >= 0 &&
        keyframeIndex <= this.export.project.keyframes.length - 1
      ) {
        this.currentKeyframeIndex = keyframeIndex;
        this.currentKeyframe = this.export.project.keyframes[keyframeIndex];
        this.log("Keyframe found and successfully set ✅");
      } else {
        this.currentKeyframeIndex = 0;
        this.currentKeyframe = this.export.project.keyframes[0];
        this.log(
          "Keyframe not found. Setting current keyframe to first keyframe.",
        );
      }

      this.log(
        `Updating canPrevious and canNext (loop enabled = ${this.loopEnabled})...`,
      );
      this.canPrevious = this.loopEnabled || this.currentKeyframeIndex > 0;
      this.canNext =
        this.loopEnabled ||
        this.currentKeyframeIndex < this.export.project.keyframes.length - 1;

      this.log(
        `Updated flags canPrevious = ${this.canPrevious} and canNext (${this.canNext}).`,
      );

      // Stop old timeout and start again after user interaction
      if (this.autoplayTimeout) {
        this.autoplayTick();
      }

      this.updateControls();
      this.updateImage();
    }

    updateImage() {
      const keyframeNaturalWidth = Math.ceil(
        this.currentKeyframe.width * this.imageNaturalWidth,
      );
      const keyframeNaturalHeight = Math.ceil(
        this.currentKeyframe.height * this.imageNaturalHeight,
      );

      // Compute scale factor
      let scale =
        keyframeNaturalWidth === 0
          ? 0
          : this.wrapperWidth / keyframeNaturalWidth;

      if (scale * keyframeNaturalHeight > this.wrapperHeight) {
        scale =
          keyframeNaturalHeight === 0
            ? 0
            : this.wrapperHeight / keyframeNaturalHeight;
      }

      // Compute translation
      const scaledImageWidth = Math.ceil(this.imageNaturalWidth * scale);
      const scaledImageHeight = Math.ceil(this.imageNaturalHeight * scale);

      const scaledKeyframeX = Math.floor(
        this.currentKeyframe.x * scaledImageWidth,
      );
      const scaledKeyframeY = Math.floor(
        this.currentKeyframe.y * scaledImageHeight,
      );
      const scaledKeyframeWidth = Math.ceil(keyframeNaturalWidth * scale);
      const scaledKeyframeHeight = Math.ceil(keyframeNaturalHeight * scale);

      const left =
        (this.wrapperWidth - scaledKeyframeWidth) / 2 - scaledKeyframeX;

      const top =
        (this.wrapperHeight - scaledKeyframeHeight) / 2 - scaledKeyframeY;

      this.image.style.left = `${left}px`;
      this.image.style.top = `${top}px`;
      this.image.style.width = `${scaledImageWidth}px`;
      this.image.style.height = `${scaledImageHeight}px`;
    }

    updateControls() {
      this.firstButton.disabled = !this.canPrevious;
      this.previousButton.disabled = !this.canPrevious;
      this.nextButton.disabled = !this.canNext;
      this.lastButton.disabled = !this.canNext;

      this.keyframeInfo.innerText = `${this.currentKeyframeIndex + 1} / ${
        this.export.project.keyframes.length
      }`;
    }

    applyHeaderConfigs() {
      this.log("Applying header configs...");
      if (this.headerTitle) {
        this.headerTitle.innerText = this.export.project.name;
      }
      this.log("Applied header configs successfully ✅");
    }

    applyStyleConfigs() {
      this.log("Applying style configs...");
      this.wrapper.style.backgroundColor = this.export.project.backgroundColor;
      this.log("Applied style configs successfully ✅");
    }

    applyTransitionConfigs() {
      this.log("Applying animation configs...");
      this.image.style.transitionProperty = "width, height, left, top";
      this.image.style.transitionDuration = `${this.export.project.animationDuration}ms`;
      this.image.style.transitionTimingFunction =
        this.export.project.animationType;
      this.log("Applied animation configs successfully ✅");
    }

    startWrapperResizeTracking() {
      this.log("Registering ResizeObserver for wrapper element...");
      const resizeObserver = new ResizeObserver(() => {
        const box = this.wrapper.getBoundingClientRect();
        this.wrapperWidth = box.width;
        this.wrapperHeight = box.height;
        this.updateImage();
      });
      resizeObserver.observe(this.wrapper, { box: "border-box" });

      this.log("Created wrapper successfully ✅");
    }

    createLayout() {
      this.log("Creating layout element ...");
      this.layout = document.createElement("div");
      this.layout.classList.add("layout");
      this.layout.style.borderRadius = this.borderRadius;
      this.shadowRoot.append(this.layout);
      this.log("Created layout successfully ✅");
    }

    createHeader() {
      const showShare =
        !this.hideImageDownload ||
        !this.hideExportDownload ||
        this.showCopyLinkToViewer;
      const showHeader = !this.hideTitle || !this.hideBranding || showShare;

      if (showHeader) {
        this.log("Creating header element ...");

        this.header = document.createElement("div");
        this.header.classList.add("header");
        this.header.style.borderTopLeftRadius = this.borderRadius;
        this.header.style.borderTopRightRadius = this.borderRadius;
        this.layout.append(this.header);

        this.headerLeft = document.createElement("div");
        this.headerLeft.classList.add("headerLeft");
        this.header.append(this.headerLeft);

        this.headerCenter = document.createElement("div");
        this.headerCenter.classList.add("headerCenter");
        this.header.append(this.headerCenter);

        this.headerRight = document.createElement("div");
        this.headerRight.classList.add("headerRight");
        this.header.append(this.headerRight);

        if (!this.hideBranding) {
          this.log("Adding branding ...");
          this.headerBranding = document.createElement("a");
          this.headerBranding.href = "https://pan-n-zoom.peter-kuhmann.de";
          this.headerBranding.target = "_blank";
          this.headerBranding.rel = "noreferrer";
          this.headerBranding.title = "Visit Pan'n'Zoom website";
          this.headerBranding.classList.add("branding");
          this.headerBranding.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 178.86406955785515 145.28195639097453"><g stroke-linecap="round"><g transform="translate(69.64358622812688 30.965675245747605) rotate(0 19.788448550799785 41.67530294973963)" fill-rule="evenodd"><path d="M1.15 1.26 L24.11 2.61 L33.56 0.95 L40.66 -4.76 L53.83 -15.44 L62.01 -19.5 L66.75 -17.78 L74.98 -12.5 L79.56 -11.56 L81.07 -4.23 L80.79 18.34 L85.73 37.56 L84.81 50.75 L97.12 53.07 L96.89 56.9 L96.65 67.02 L94.94 78.13 L87.7 82.31 L85.33 84.09 L78.45 78.14 L71.49 87.99 L66.42 93.28 L54.53 96.07 L38.31 101.84 L17.13 104.58 L-2.33 100.64 L-11.76 98.36 L-30.48 87.71 L-36.15 76.79 L-52.11 81.1 L-55.52 74.52 L-60.59 68.52 L-58.76 57.47 L-53.95 48.6 L-46.22 49.81 L-44.25 31.52 L-42.23 19.91 L-43.42 -10.5 L-40.03 -17.24 L-34.38 -17.73 L-19.83 -15.99 L1.9 -1.37" stroke="none" stroke-width="0" fill="#ffffff" fill-rule="evenodd"></path><path d="M0.94 0.58 C6.89 0.93, 25.36 4.32, 35.42 1.09 C45.47 -2.14, 54.11 -16.99, 61.27 -18.8 C68.43 -20.61, 75.24 -15.87, 78.36 -9.79 C81.48 -3.71, 78.69 9.54, 80.01 17.69 C81.33 25.83, 85.23 33.71, 86.29 39.06 C87.34 44.4, 84.56 46.83, 86.35 49.77 C88.13 52.7, 95.71 51.81, 96.98 56.67 C98.25 61.53, 95.81 74.47, 93.98 78.93 C92.15 83.39, 89.02 83.44, 86.01 83.43 C83 83.42, 78.71 77.46, 75.89 78.85 C73.06 80.24, 75.09 88.1, 69.06 91.76 C63.04 95.42, 51.62 99.27, 39.72 100.79 C27.83 102.31, 9.4 103.48, -2.31 100.87 C-14.02 98.26, -24.79 89.44, -30.54 85.12 C-36.28 80.8, -32.86 75.55, -36.77 74.94 C-40.68 74.33, -50.19 82.76, -54 81.45 C-57.81 80.15, -59.47 72.43, -59.64 67.11 C-59.8 61.8, -57.33 52.64, -55.01 49.55 C-52.7 46.47, -47.54 51.85, -45.76 48.63 C-43.98 45.4, -44.97 35.14, -44.35 30.19 C-43.73 25.24, -42.29 23.37, -42.04 18.93 C-41.79 14.5, -42.99 9.77, -42.85 3.58 C-42.72 -2.6, -44.64 -15.1, -41.23 -18.17 C-37.82 -21.24, -29.28 -17.69, -22.41 -14.84 C-15.55 -11.99, -3.75 -3.4, -0.02 -1.08 M-0.02 -0.16 C5.83 -0.08, 24.55 2.11, 34.73 -0.8 C44.92 -3.7, 53.84 -16.34, 61.09 -17.61 C68.33 -18.89, 75.22 -14.33, 78.2 -8.45 C81.17 -2.56, 77.9 9.87, 78.93 17.7 C79.95 25.53, 82.94 33.39, 84.34 38.54 C85.74 43.69, 84.85 45.64, 87.32 48.6 C89.78 51.56, 98.2 51.5, 99.11 56.32 C100.03 61.13, 94.82 72.96, 92.81 77.46 C90.8 81.96, 89.92 82.89, 87.06 83.3 C84.21 83.71, 78.83 78.63, 75.66 79.93 C72.49 81.23, 73.94 87.82, 68.06 91.11 C62.17 94.41, 52.25 97.58, 40.37 99.69 C28.49 101.8, 8.54 105.77, -3.21 103.77 C-14.97 101.76, -24.24 92.34, -30.17 87.65 C-36.1 82.95, -35.15 76.49, -38.78 75.6 C-42.4 74.71, -48.77 83.64, -51.91 82.31 C-55.05 80.98, -56.91 72.98, -57.59 67.64 C-58.27 62.31, -58.01 53.17, -56 50.31 C-53.99 47.44, -47.39 53.45, -45.56 50.44 C-43.73 47.44, -45.58 37.18, -45.03 32.28 C-44.49 27.38, -42.67 25.88, -42.3 21.05 C-41.92 16.22, -43.19 10, -42.77 3.31 C-42.36 -3.39, -43.43 -15.65, -39.82 -19.14 C-36.22 -22.63, -27.98 -20.54, -21.16 -17.65 C-14.33 -14.76, -2.63 -5.04, 1.12 -1.8" stroke="transparent" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(87.77810328811483 38.843681781948135) rotate(0 -0.10674841860463857 42.33992798606093)"><path d="M0.29 0.24 C-7.65 2.11, -37.26 2.03, -46.77 10.25 C-56.28 18.47, -60.92 37.63, -56.77 49.56 C-52.63 61.5, -38.4 77.09, -21.88 81.86 C-5.36 86.63, 29.31 84.68, 42.36 78.18 C55.4 71.68, 55.25 53.64, 56.38 42.85 C57.5 32.06, 58.55 20.52, 49.1 13.44 C39.66 6.36, 7.78 2.66, -0.32 0.35 M-1.02 -0.68 C-8.64 1.44, -34.96 2.96, -44.42 11.5 C-53.88 20.05, -61.58 38.66, -57.77 50.58 C-53.96 62.51, -38.1 78.38, -21.55 83.04 C-5.01 87.71, 28.26 84.89, 41.48 78.57 C54.71 72.24, 56.41 55.63, 57.8 45.09 C59.18 34.54, 59.68 22.79, 49.79 15.31 C39.91 7.82, 6.94 2.47, -1.51 0.19" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(36.67295083535373 54.057804514530176) rotate(0 11.514205728042725 -16.135194644519203)"><path d="M-0.7 -0.55 C-0.76 -6.23, -4.52 -31.43, -0.12 -33.83 C4.27 -36.23, 21.2 -18.08, 25.66 -14.97 M1.14 1.78 C0.85 -3.77, -5.27 -30.03, -1.3 -32.59 C2.68 -35.15, 20.79 -16.66, 24.98 -13.57" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(112.19584960976954 42.11587204758149) rotate(0 13.71338336728968 -3.490243827490218)"><path d="M-0.43 -0.57 C3.82 -3.58, 20.13 -20.43, 24.81 -18.59 C29.48 -16.76, 27.32 5.72, 27.6 10.44 M1.54 1.75 C5.71 -0.99, 19.62 -18.64, 23.94 -16.98 C28.25 -15.31, 26.96 7.18, 27.43 11.75" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round" transform="translate(52.994725250166994 82.82096682734533) rotate(0 6.2688210594437805 6.052512668199228)"><path d="M3.86 1.25 C5.14 0.91, 6.86 0.73, 8.26 1.13 C9.66 1.54, 11.64 2.78, 12.24 3.7 C12.84 4.63, 12.23 5.65, 11.84 6.69 C11.46 7.74, 10.67 9.19, 9.93 9.97 C9.18 10.76, 8.75 11.29, 7.37 11.42 C5.99 11.54, 2.71 11.5, 1.63 10.73 C0.55 9.95, 1.13 8.17, 0.87 6.77 C0.62 5.37, -0.5 3.45, 0.1 2.32 C0.71 1.18, 3.55 0.43, 4.48 -0.02 C5.41 -0.48, 5.74 -0.49, 5.67 -0.42 M4.41 1.62 C5.64 1.23, 9.36 0.91, 10.6 1.21 C11.84 1.5, 11.51 2.52, 11.86 3.41 C12.21 4.29, 13.06 5.27, 12.68 6.5 C12.3 7.73, 10.92 9.87, 9.6 10.77 C8.27 11.68, 6.2 12.17, 4.7 11.91 C3.2 11.65, 1.22 9.99, 0.58 9.22 C-0.05 8.45, 0.65 8.48, 0.89 7.29 C1.12 6.1, 1.11 3.37, 2 2.08 C2.88 0.8, 5.82 -0.23, 6.19 -0.42 C6.56 -0.62, 4.62 0.88, 4.21 0.92" stroke="none" stroke-width="0" fill="#1e1e1e"></path><path d="M8.52 0.74 C9.58 1.19, 10.67 2.18, 11.34 3.44 C12.01 4.7, 12.88 7.08, 12.55 8.28 C12.21 9.47, 10.44 9.81, 9.31 10.6 C8.18 11.39, 7.08 12.93, 5.77 13 C4.46 13.07, 2.51 12.13, 1.44 11.02 C0.37 9.92, -0.78 7.96, -0.66 6.37 C-0.54 4.77, 1.23 2.59, 2.14 1.48 C3.04 0.37, 3.36 -0.37, 4.78 -0.29 C6.19 -0.2, 9.49 1.45, 10.63 1.98 C11.77 2.51, 11.89 2.92, 11.61 2.9 M7.4 1.24 C9.04 1.4, 10.33 1.76, 11.19 2.37 C12.04 2.98, 12.6 3.75, 12.52 4.93 C12.44 6.11, 11.27 8.15, 10.72 9.44 C10.18 10.73, 10.19 12.07, 9.23 12.65 C8.27 13.22, 6.31 13.46, 4.95 12.9 C3.59 12.33, 2.12 10.4, 1.06 9.25 C0 8.11, -1.76 7.29, -1.41 6.03 C-1.06 4.77, 2.05 2.95, 3.17 1.71 C4.29 0.46, 4.95 -1.01, 5.31 -1.42 C5.67 -1.83, 5.26 -1.07, 5.33 -0.75" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g stroke-linecap="round"><g transform="translate(88.78946326401365 90.3576788206762) rotate(0 -0.3745322374661555 3.2159951121657286)"><path d="M1.14 -0.01 C0.95 1.02, -0.61 5.31, -0.95 6.35 M0.28 -1.07 C-0.08 0.09, -1.58 6.14, -1.89 7.5" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(88.09807301992714 98.20777671146453) rotate(0 -6.3449631185812905 0.16954234327636186)"><path d="M0.01 -0.73 C-1.05 -0.46, -3.26 1.53, -5.23 1.59 C-7.19 1.65, -10.82 0.1, -11.77 -0.36 M-1.44 1.5 C-2.75 1.9, -4.25 3.35, -6.13 2.68 C-8 2.01, -11.99 -2.03, -12.7 -2.52" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(88.59570203257772 98.52087410133475) rotate(0 5.285967503072243 1.418640784697942)"><path d="M0.09 -0.85 C1.05 -0.09, 3.83 3.86, 5.8 3.84 C7.77 3.81, 11.07 -0.32, 11.89 -1 M-1.32 1.32 C-0.54 1.77, 2.56 2.1, 4.68 1.9 C6.81 1.69, 10.41 0.24, 11.4 0.09" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round" transform="translate(111.68526782681602 101.71824582202345) rotate(0 6.761657148273571 1.8170478481298176)"><path d="M9.14 -0.36 C10.66 -0.31, 13.21 -0.03, 13.76 0.39 C14.31 0.81, 12.85 1.8, 12.44 2.19 C12.03 2.57, 12.44 2.65, 11.28 2.73 C10.12 2.81, 7.07 2.66, 5.47 2.68 C3.86 2.71, 2.57 3.09, 1.67 2.87 C0.77 2.66, 0.27 1.79, 0.07 1.38 C-0.14 0.96, -0.34 0.45, 0.43 0.38 C1.21 0.31, 2.8 1.01, 4.71 0.96 C6.62 0.91, 10.46 -0.07, 11.91 0.07 C13.36 0.2, 13.55 1.72, 13.42 1.79 M5.85 -0.42 C7.02 -0.27, 8.63 0.01, 9.69 0.15 C10.75 0.29, 11.49 -0.16, 12.2 0.41 C12.9 0.98, 14.19 3.1, 13.92 3.57 C13.65 4.04, 11.82 3.3, 10.59 3.22 C9.36 3.13, 8.2 2.98, 6.54 3.05 C4.88 3.12, 1.94 3.99, 0.62 3.62 C-0.71 3.25, -1.62 1.54, -1.41 0.83 C-1.21 0.12, 0.68 -0.32, 1.84 -0.66 C3 -1.01, 5.01 -1.47, 5.55 -1.24 C6.08 -1.01, 5.22 0.31, 5.03 0.72" stroke="none" stroke-width="0" fill="#ffc9c9"></path><path d="M8.51 0.99 C9.89 1.28, 11.17 1.41, 11.89 1.57 C12.62 1.72, 12.73 1.82, 12.85 1.91 C12.97 2, 13.49 1.91, 12.61 2.13 C11.73 2.34, 9.02 2.84, 7.55 3.18 C6.07 3.52, 4.82 4.12, 3.77 4.15 C2.73 4.18, 1.92 3.84, 1.26 3.36 C0.61 2.89, -0.55 1.96, -0.16 1.3 C0.22 0.65, 2.08 -0.51, 3.57 -0.56 C5.07 -0.61, 7.6 0.75, 8.82 1.01 C10.04 1.26, 10.75 1.08, 10.89 0.97 M7.65 0.98 C9.31 1.06, 10.95 1.46, 11.94 1.56 C12.92 1.66, 13.73 1.24, 13.58 1.58 C13.43 1.92, 11.63 3.27, 11.01 3.62 C10.4 3.98, 11.17 3.97, 9.91 3.71 C8.65 3.45, 5.09 2.39, 3.45 2.07 C1.8 1.75, 0.64 1.92, 0.03 1.79 C-0.58 1.66, -0.42 1.32, -0.22 1.3 C-0.02 1.29, 0.24 2.1, 1.25 1.72 C2.26 1.34, 4.97 -0.67, 5.84 -0.95 C6.71 -1.24, 6.11 -0.19, 6.5 0.03" stroke="#ffd4d4" stroke-width="2" fill="none"></path></g><g stroke-linecap="round"><g transform="translate(144.25095496861195 93.83196926613454) rotate(0 5.752100570724451 -2.9703092261079576)"><path d="M0.52 -0.42 C2.21 -1.08, 7.95 -2.94, 9.79 -3.57 M-0.66 -1.69 C1.45 -2.75, 10.16 -5.3, 12.17 -5.52" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(143.04305758794817 98.46583753233148) rotate(0 6.01642940375541 2.6936418221907843)"><path d="M-0.65 0.34 C1.38 1.16, 10.48 3.92, 12.68 4.53 M1.22 -0.53 C3.14 0.51, 10.47 5.01, 12.33 5.92" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(32.34312581281574 91.56103794834513) rotate(0 -4.9515958341535224 -2.2113298042244196)"><path d="M1.13 -0.28 C-0.53 -1.03, -8.5 -3.81, -10.63 -4.14 M0.27 -1.47 C-1.41 -2.11, -8.93 -2.59, -11.04 -3.03" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round"><g transform="translate(34.1442076104513 97.36365577751138) rotate(0 -6.535562851585837 2.5332616727323796)"><path d="M1.03 -0.8 C-1.36 0.22, -10.61 4.95, -13.16 5.87 M0.11 1.39 C-2.53 2.13, -12.09 3.53, -14.1 4.29" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g></g><mask></mask><g stroke-linecap="round" transform="translate(114.21554218945039 84.65442509716962) rotate(0 6.2688210594437805 6.052512668199228)"><path d="M4.2 0.06 C5.51 -0.32, 7.64 -0.57, 8.77 -0.09 C9.91 0.39, 10.47 1.54, 11.01 2.94 C11.54 4.34, 12.04 7.07, 11.97 8.32 C11.91 9.58, 11.47 9.7, 10.63 10.48 C9.79 11.26, 8.32 13.02, 6.94 12.99 C5.55 12.96, 3.5 11.3, 2.31 10.31 C1.11 9.33, 0.14 8.35, -0.24 7.1 C-0.62 5.84, -0.91 4.04, 0.03 2.79 C0.97 1.54, 4.26 0.15, 5.4 -0.4 C6.54 -0.95, 6.91 -0.77, 6.87 -0.5 M9.64 -0.16 C10.62 0.35, 10.67 2.69, 10.9 3.76 C11.13 4.82, 11.1 5.28, 11.01 6.23 C10.92 7.19, 11.21 8.69, 10.36 9.46 C9.52 10.23, 7.44 10.54, 5.95 10.85 C4.46 11.16, 2.63 11.77, 1.4 11.31 C0.18 10.85, -1.38 9.66, -1.39 8.08 C-1.4 6.51, 0.39 3.12, 1.33 1.88 C2.27 0.64, 2.86 1.09, 4.23 0.62 C5.61 0.15, 8.93 -1.03, 9.57 -0.96 C10.22 -0.9, 8.23 0.72, 8.11 1.02" stroke="none" stroke-width="0" fill="#1e1e1e"></path><path d="M4.13 1.43 C5.42 1.05, 7.61 0.97, 8.7 1.17 C9.78 1.37, 10.02 1.9, 10.64 2.65 C11.27 3.4, 12.5 4.27, 12.46 5.68 C12.42 7.09, 11.19 9.94, 10.41 11.12 C9.63 12.3, 8.94 12.76, 7.79 12.76 C6.63 12.77, 4.75 12.12, 3.51 11.17 C2.27 10.21, 0.77 8.23, 0.33 7.04 C-0.11 5.85, 0.02 5.12, 0.88 4.04 C1.74 2.97, 4.48 1.22, 5.5 0.58 C6.52 -0.06, 7.1 0.34, 7.02 0.2 M7.23 -1.19 C8.18 -1.1, 9.9 0.5, 10.72 1.79 C11.53 3.08, 12.37 4.89, 12.13 6.55 C11.89 8.21, 10.36 10.98, 9.26 11.74 C8.16 12.51, 6.73 11.27, 5.53 11.13 C4.33 11, 2.76 11.52, 2.07 10.94 C1.38 10.37, 1.4 8.77, 1.38 7.68 C1.35 6.6, 1.3 5.78, 1.91 4.43 C2.53 3.08, 4.09 0.41, 5.07 -0.44 C6.05 -1.28, 7.43 -0.97, 7.77 -0.63 C8.12 -0.29, 7.31 1.56, 7.15 1.59" stroke="#1e1e1e" stroke-width="2" fill="none"></path></g><g stroke-linecap="round" transform="translate(54.20072631253879 99.83832072428123) rotate(0 6.761657148273571 1.8170478481298176)"><path d="M3.74 -0.37 C4.83 -0.59, 6.09 -0.65, 7.43 -0.32 C8.77 0.01, 10.65 1.32, 11.76 1.63 C12.87 1.93, 13.95 1.12, 14.11 1.51 C14.27 1.89, 13.74 3.62, 12.71 3.95 C11.67 4.27, 9.56 3.51, 7.9 3.46 C6.25 3.41, 4.23 3.83, 2.8 3.65 C1.36 3.47, -0.26 2.88, -0.68 2.38 C-1.11 1.89, -0.54 1.16, 0.24 0.68 C1.03 0.2, 3.38 -0.52, 4 -0.51 C4.62 -0.5, 3.79 0.52, 3.97 0.73 M5.47 0.68 C6.41 0.57, 8 -0.49, 9.33 -0.58 C10.66 -0.67, 12.9 -0.21, 13.44 0.12 C13.98 0.44, 13.37 0.69, 12.58 1.36 C11.79 2.03, 10.24 3.6, 8.71 4.14 C7.18 4.68, 4.59 5, 3.41 4.6 C2.23 4.2, 2.16 2.19, 1.61 1.74 C1.05 1.29, -0.17 2.33, 0.09 1.9 C0.35 1.47, 2.19 -0.61, 3.17 -0.84 C4.16 -1.07, 5.36 0.4, 5.99 0.52 C6.62 0.64, 6.71 -0.16, 6.95 -0.12" stroke="none" stroke-width="0" fill="#ffc9c9"></path><path d="M6.24 1.04 C7.34 0.83, 8.08 0.5, 9.2 0.39 C10.32 0.27, 12.34 -0.12, 12.94 0.36 C13.55 0.83, 13.11 2.63, 12.82 3.25 C12.54 3.86, 12.27 3.97, 11.23 4.04 C10.19 4.12, 8.17 3.98, 6.61 3.7 C5.04 3.41, 2.9 2.56, 1.86 2.33 C0.82 2.1, 0.33 2.52, 0.36 2.32 C0.39 2.12, 1 1.51, 2.04 1.14 C3.08 0.77, 5.85 0.44, 6.59 0.1 C7.32 -0.25, 6.46 -1.08, 6.45 -0.94 M6.38 -0.87 C7.83 -0.66, 10.06 -0.27, 11.01 0.36 C11.97 1, 12.07 2.69, 12.11 2.94 C12.15 3.19, 11.9 1.75, 11.25 1.85 C10.59 1.96, 9.2 3.25, 8.21 3.55 C7.21 3.85, 6.33 3.63, 5.3 3.65 C4.26 3.67, 2.64 4.2, 2.01 3.67 C1.38 3.13, 1.45 1.14, 1.53 0.44 C1.61 -0.25, 1.69 -0.63, 2.48 -0.5 C3.28 -0.37, 5.72 1.36, 6.32 1.25 C6.92 1.13, 6 -1.2, 6.1 -1.2" stroke="#ffd4d4" stroke-width="2" fill="none"></path></g><g stroke-linecap="round" transform="translate(42.750203243108444 30.168534170236057) rotate(345.86228717078205 2.2819223386682097 6.593339701788977)"><path d="M1.19 -0.33 C1.58 -0.31, 2.51 1.25, 3.16 2.03 C3.8 2.82, 4.7 3.02, 5.07 4.37 C5.44 5.73, 5.61 8.84, 5.37 10.17 C5.12 11.5, 4.25 11.84, 3.6 12.36 C2.94 12.88, 2.13 13.61, 1.44 13.3 C0.75 12.99, -0.26 11.76, -0.55 10.5 C-0.83 9.23, -0.47 7.23, -0.29 5.7 C-0.1 4.18, 0.23 2.2, 0.56 1.35 C0.88 0.5, 1.23 0.72, 1.66 0.59 C2.08 0.46, 3.04 0.42, 3.11 0.56 M0.45 -0.82 C1.06 -1.47, 2.9 -1.05, 3.52 -0.41 C4.14 0.24, 4.14 1.39, 4.16 3.04 C4.18 4.68, 4.01 7.75, 3.64 9.47 C3.28 11.18, 2.18 12.9, 1.96 13.32 C1.75 13.74, 2.59 12.36, 2.36 12 C2.13 11.64, 0.8 12.26, 0.59 11.15 C0.38 10.03, 1.16 6.67, 1.1 5.29 C1.04 3.92, -0.03 3.8, 0.21 2.91 C0.44 2.02, 2.05 0.3, 2.5 -0.05 C2.96 -0.4, 2.89 0.66, 2.93 0.82" stroke="none" stroke-width="0" fill="#ffc9c9"></path><path d="M2.5 0.7 C2.77 0.86, 3.98 1.46, 4.25 2.83 C4.52 4.21, 4.08 7.34, 4.12 8.96 C4.15 10.58, 4.69 11.84, 4.48 12.55 C4.28 13.27, 3.49 13.56, 2.88 13.26 C2.27 12.95, 1.22 11.61, 0.8 10.7 C0.38 9.8, 0.33 9.03, 0.37 7.82 C0.41 6.61, 0.69 4.67, 1.02 3.43 C1.35 2.19, 1.93 0.93, 2.34 0.37 C2.76 -0.19, 3.19 -0.3, 3.52 0.06 C3.85 0.42, 4.35 2.37, 4.35 2.54 M0.86 0.6 C1.16 0.28, 1.08 1.33, 1.42 1.5 C1.77 1.67, 2.48 0.75, 2.92 1.65 C3.36 2.55, 3.67 5.3, 4.04 6.9 C4.41 8.5, 5.18 10.02, 5.15 11.23 C5.12 12.44, 4.31 14.17, 3.85 14.16 C3.39 14.15, 3.06 12.26, 2.4 11.18 C1.74 10.1, 0.39 8.67, -0.12 7.69 C-0.62 6.7, -0.69 6.65, -0.64 5.29 C-0.58 3.92, -0.07 0.05, 0.21 -0.51 C0.49 -1.06, 1.02 1.78, 1.06 1.94" stroke="#ffd4d4" stroke-width="2" fill="none"></path></g><g stroke-linecap="round" transform="translate(126.77768343098887 33.12220191448171) rotate(18.443417074308265 2.2819223386682097 6.593339701788977)"><path d="M1.24 1.17 C1.92 0.71, 3.11 -0.42, 3.79 0.15 C4.48 0.71, 5.16 3.25, 5.33 4.56 C5.5 5.87, 5.15 6.71, 4.82 7.99 C4.49 9.27, 3.96 11.35, 3.35 12.22 C2.74 13.09, 1.64 13.42, 1.16 13.21 C0.67 12.99, 0.62 12.03, 0.41 10.93 C0.21 9.84, 0.03 7.89, -0.07 6.66 C-0.17 5.43, -0.63 4.56, -0.18 3.53 C0.27 2.5, 2.27 0.93, 2.66 0.5 C3.04 0.06, 2.28 0.97, 2.11 0.91 M2.91 -1.1 C3.56 -0.94, 3.7 -0.09, 3.85 1.36 C3.99 2.81, 4 5.8, 3.77 7.59 C3.54 9.38, 2.6 11.38, 2.48 12.12 C2.35 12.86, 3.25 12, 3.02 12.04 C2.79 12.09, 1.39 13.22, 1.09 12.41 C0.79 11.6, 1.41 8.49, 1.2 7.18 C1 5.87, -0.25 5.65, -0.14 4.55 C-0.02 3.44, 1.21 1.2, 1.88 0.57 C2.54 -0.07, 3.56 0.76, 3.84 0.75 C4.13 0.73, 3.6 0.45, 3.59 0.47" stroke="none" stroke-width="0" fill="#ffc9c9"></path><path d="M3.31 0.04 C3.78 0.72, 3.69 3.51, 4.02 5.07 C4.34 6.63, 5.24 8.18, 5.27 9.39 C5.3 10.59, 4.73 11.79, 4.19 12.3 C3.65 12.8, 2.56 12.55, 2.02 12.4 C1.47 12.25, 1.15 12.25, 0.92 11.38 C0.7 10.51, 0.6 8.65, 0.65 7.18 C0.7 5.71, 1.03 3.9, 1.23 2.56 C1.42 1.22, 1.29 -0.89, 1.84 -0.85 C2.38 -0.81, 4.08 2.1, 4.51 2.81 C4.94 3.52, 4.7 3.51, 4.42 3.39 M0.26 1.62 C0.57 1.01, 1.42 -0.75, 2.01 -0.42 C2.6 -0.08, 3.19 2.17, 3.8 3.62 C4.42 5.07, 5.51 6.73, 5.69 8.27 C5.88 9.82, 5.29 12.25, 4.93 12.91 C4.56 13.56, 4.24 12.61, 3.51 12.21 C2.77 11.82, 1.21 11.13, 0.5 10.53 C-0.22 9.93, -0.61 10.07, -0.8 8.6 C-0.99 7.14, -1.02 2.94, -0.65 1.74 C-0.28 0.53, 1.2 1.74, 1.43 1.37 C1.67 0.99, 0.94 -0.37, 0.75 -0.5" stroke="#ffd4d4" stroke-width="2" fill="none"></path></g></svg>`;
          this.headerLeft.append(this.headerBranding);
        }

        if (!this.hideTitle) {
          this.log("Adding title ...");
          this.headerTitle = document.createElement("div");
          this.headerTitle.classList.add("title");
          this.headerTitle.innerText = "";
          this.headerCenter.append(this.headerTitle);
        }

        if (showShare) {
          this.log("Adding share button...");
          this.headerShare = document.createElement("div");
          this.headerShare.classList.add("share");
          this.headerRight.append(this.headerShare);

          this.headerShareButton = document.createElement("button");
          this.headerShareButton.classList.add("shareButton");
          this.headerShareButton.title = "Show share options";
          this.headerShareButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M336 192h40a40 40 0 0140 40v192a40 40 0 01-40 40H136a40 40 0 01-40-40V232a40 40 0 0140-40h40M336 128l-80-80-80 80M256 321V48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>`;
          this.headerShare.append(this.headerShareButton);

          this.headerSharePopup = document.createElement("div");
          this.headerSharePopup.classList.add("sharePopup");
          this.headerShare.append(this.headerSharePopup);

          const togglePopup = (hide) => {
            if (hide || this.headerSharePopup.classList.contains("open")) {
              this.headerSharePopup.classList.remove("open");
            } else {
              this.headerSharePopup.classList.add("open");
            }
          };

          this.headerShareButton.onclick = () => {
            togglePopup();
          };
          this.headerShareButton.onblur = () => {
            setTimeout(() => {
              togglePopup(true);
            }, 150);
          };

          if (!this.hideImageDownload) {
            this.log("Adding download image option...");
            this.headerDownloadImageOption = document.createElement("button");
            this.headerDownloadImageOption.classList.add("downloadImageOption");
            this.headerDownloadImageOption.title = "Save image to your disk";
            this.headerDownloadImageOption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><rect x="48" y="80" width="416" height="352" rx="48" ry="48" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/><circle cx="336" cy="176" r="32" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path d="M304 335.79l-90.66-90.49a32 32 0 00-43.87-1.3L48 352M224 432l123.34-123.34a32 32 0 0143.11-2L464 368" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>`;
            this.headerDownloadImageOption.innerHTML += "Download image";
            this.headerDownloadImageOption.onclick = () => {
              this.downloadImage();
            };
            this.headerSharePopup.append(this.headerDownloadImageOption);
          }

          if (!this.hideExportDownload) {
            this.log("Adding download export option...");
            this.headerDownloadExportOption = document.createElement("button");
            this.headerDownloadExportOption.classList.add(
              "downloadExportOption",
            );
            this.headerDownloadExportOption.title =
              "Save Pan'n'Zoom project to your disk";
            this.headerDownloadExportOption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M336 176h40a40 40 0 0140 40v208a40 40 0 01-40 40H136a40 40 0 01-40-40V216a40 40 0 0140-40h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M176 272l80 80 80-80M256 48v288"/></svg>`;
            this.headerDownloadExportOption.innerHTML +=
              "Download Pan'n'Zoom project";
            this.headerDownloadExportOption.onclick = () => {
              this.downloadExport();
            };
            this.headerSharePopup.append(this.headerDownloadExportOption);
          }

          if (this.showCopyLinkToViewer && this.dataset.exportUrl) {
            this.log("Adding copy link to viewer option...");
            this.headerCopyLinkToViewerOption =
              document.createElement("button");
            this.headerCopyLinkToViewerOption.classList.add(
              "copyLinkToViewerOption",
            );
            this.headerCopyLinkToViewerOption.title =
              "Copy viewer link to your clipboard";
            this.headerCopyLinkToViewerOption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M208 352h-64a96 96 0 010-192h64M304 160h64a96 96 0 010 192h-64M163.29 256h187.42" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="36"/></svg>`;
            this.headerCopyLinkToViewerOption.innerHTML +=
              "Copy link to viewer";
            this.headerCopyLinkToViewerOption.onclick = () => {
              this.copyLinkToViewer();
            };
            this.headerSharePopup.append(this.headerCopyLinkToViewerOption);
          }
        }

        this.log("Created layout successfully ✅");
      }
    }

    createWrapper() {
      this.log("Creating presentation wrapper element...");

      const aspectRatio = this.dataset.canvasAspectRatio;
      const maxHeight = this.dataset.canvasMaxHeight;

      this.wrapper = document.createElement("div");
      this.wrapper.classList.add("wrapper");
      this.wrapper.onclick = () => {
        this.nextKeyframe();
      };

      if (!this.header) {
        this.wrapper.style.borderTopLeftRadius = this.borderRadius;
        this.wrapper.style.borderTopRightRadius = this.borderRadius;
      }

      this.wrapper.style.aspectRatio = aspectRatio;
      this.wrapper.style.maxHeight = maxHeight;

      if (!aspectRatio && !maxHeight) {
        this.layout.style.height = "100%";
        this.wrapper.style.height = "1px";
        this.wrapper.style.flexGrow = "1";
      } else if (!aspectRatio) {
        this.wrapper.style.height = maxHeight;
      }

      this.layout.append(this.wrapper);
    }

    createControls() {
      this.log("Creating control elements...");
      this.controls = document.createElement("div");
      this.controls.classList.add("controls");
      this.layout.append(this.controls);

      this.firstButton = document.createElement("button");
      this.firstButton.classList.add("first");
      this.firstButton.title = "First step";
      this.firstButton.onclick = () => {
        this.firstKeyframe();
      };
      this.firstButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor" d="M30.71 229.47l188.87-113a30.54 30.54 0 0131.09-.39 33.74 33.74 0 0116.76 29.47v79.05l180.72-108.16a30.54 30.54 0 0131.09-.39A33.74 33.74 0 01496 145.52v221A33.73 33.73 0 01479.24 396a30.54 30.54 0 01-31.09-.39L267.43 287.4v79.08A33.73 33.73 0 01250.67 396a30.54 30.54 0 01-31.09-.39l-188.87-113a31.27 31.27 0 010-53z"/></svg>`;
      this.firstButton.disabled = true;
      this.controls.append(this.firstButton);

      this.previousButton = document.createElement("button");
      this.previousButton.classList.add("previous");
      this.previousButton.title = "Previous step";
      this.previousButton.onclick = () => {
        this.previousKeyframe();
      };
      this.previousButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor"  d="M112 64a16 16 0 0116 16v136.43L360.77 77.11a35.13 35.13 0 0135.77-.44c12 6.8 19.46 20 19.46 34.33v290c0 14.37-7.46 27.53-19.46 34.33a35.14 35.14 0 01-35.77-.45L128 295.57V432a16 16 0 01-32 0V80a16 16 0 0116-16z"/></svg>`;
      this.previousButton.disabled = true;
      this.controls.append(this.previousButton);

      this.keyframeInfo = document.createElement("div");
      this.keyframeInfo.classList.add("keyframeInfo");
      this.controls.append(this.keyframeInfo);

      this.nextButton = document.createElement("button");
      this.nextButton.classList.add("next");
      this.nextButton.title = "Next step";
      this.nextButton.onclick = () => {
        this.nextKeyframe();
      };
      this.nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor"  d="M400 64a16 16 0 00-16 16v136.43L151.23 77.11a35.13 35.13 0 00-35.77-.44C103.46 83.47 96 96.63 96 111v290c0 14.37 7.46 27.53 19.46 34.33a35.14 35.14 0 0035.77-.45L384 295.57V432a16 16 0 0032 0V80a16 16 0 00-16-16z"/></svg>`;
      this.nextButton.disabled = true;
      this.controls.append(this.nextButton);

      this.lastButton = document.createElement("button");
      this.lastButton.classList.add("last");
      this.lastButton.title = "Last step";
      this.lastButton.onclick = () => {
        this.lastKeyframe();
      };
      this.lastButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor"  d="M481.29 229.47l-188.87-113a30.54 30.54 0 00-31.09-.39 33.74 33.74 0 00-16.76 29.47v79.05L63.85 116.44a30.54 30.54 0 00-31.09-.39A33.74 33.74 0 0016 145.52v221A33.74 33.74 0 0032.76 396a30.54 30.54 0 0031.09-.39L244.57 287.4v79.08A33.74 33.74 0 00261.33 396a30.54 30.54 0 0031.09-.39l188.87-113a31.27 31.27 0 000-53z"/></svg>`;
      this.lastButton.disabled = true;
      this.controls.append(this.lastButton);

      this.log("Created control elements successfully ✅");
    }

    copyLinkToViewer() {
      this.log("Triggering copy link to viewer...");
      const exportUrl = this.dataset.exportUrl;
      if (exportUrl) {
        const viewerUrl = new URL("https://pan-n-zoom.peter-kuhmann.de/viewer");
        viewerUrl.searchParams.set("exportUrl", normalizeExportUrl(exportUrl));
        copyTextToClipboard(viewerUrl.href);
      }
    }

    downloadImage() {
      this.log("Triggering image download...");
      if (this.export) {
        downloadDataUrlToDisk(
          this.export.imageDataUrl,
          this.export.project.image.fileName,
        );
      }
    }

    downloadExport() {
      this.log("Triggering export download...");
      if (this.export) {
        downloadDataExportToDisk(
          {
            type: "plain-project-export",
            projects: [this.export],
          },
          this.export.project.name,
        );
      }
    }

    async createImage() {
      this.log("Creating image element...");

      await decodeImage(this.export.imageDataUrl).then((image) => {
        image.style.width = "0";
        image.style.height = "0";
        this.imageNaturalWidth = image.naturalWidth;
        this.imageNaturalHeight = image.naturalHeight;

        if (this.export.project.embedSvgNatively === true) {
          const dataUrlMatch = /data:([^;]+);base64,(.+)/.exec(
            this.export.imageDataUrl,
          );

          if (dataUrlMatch) {
            const mimeType = dataUrlMatch[1];
            const base64Data = dataUrlMatch[2];

            if (mimeType === "image/svg+xml") {
              const decodedSvg = base64ToUtf8(base64Data);
              const dummyContainer = document.createElement("div");
              dummyContainer.innerHTML = decodedSvg;

              const svgElement = dummyContainer.querySelector("svg");

              if (svgElement) {
                svgElement.style.width = "0";
                svgElement.style.height = "0";
                this.image = svgElement;
                this.wrapper.append(svgElement);
                this.log("Created an SVG element successfully ✅");
                return;
              }
            }
          }
        }

        this.image = image;
        this.wrapper.append(image);
        this.log("Created a plain image element successfully ✅");
      });
    }

    initStyles() {
      this.log("Adding styles...");
      this.style.display = "block";

      const style = document.createElement("style");

      const baseLightModeStyle = `
* {
  box-sizing: border-box;
}
      
.layout {
  width: 100%;
  
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  
  border: 1px solid #1e2937;
  color: #1e2937;
  overflow: hidden;
  user-select: none;
}

.header {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1.5em;
  padding: 0.2em 1em;
  font-size: 1em;
  
  background: white;
  border-bottom: 1px solid #1e2937;
}

.header .branding {
  display: block;
  height: 1.8em;
  width: 1.8em;
  cursor: pointer;
}

.header .branding svg {
  height: 100%;
}

.header .share {
  display: flex;
  height: 1.8em;
  width: 1.8em;
  justify-content: center;
  align-items: center;
  position: relative;
}

.header .shareButton {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  color: #1e2937;
}

.header .shareButton svg {
  width: 1.6em;
  height: 1.6em;
}

.header .sharePopup {
  display: none;
  z-index: 100;
  position: absolute;
  background: red;
  padding: 0.75em;
  top: 1.6em;
  right: -0.5em;
  
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 0.75em;
  
  background: white;
  border-radius: 8px;
  border: 1px solid #1e2937;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.header .sharePopup.open {
  display: flex;
}

.header .sharePopup button {
  width: 100%;
  cursor: pointer;
  border: none;
  outline: none;
  white-space: pre;
  word-break: keep-all;
  
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  gap: 0.5em;
  
  padding: 0.5em 1em;
  border-radius: 4px;
  
  background: #f3f3f3;
  color: #1e2937;
}

.header .sharePopup button svg {
  width: 1.5em;
  height: 1.5em;
}

@media (max-width: 600px) {
  .header { 
    font-size: 0.9em;
    gap: 1em;
    padding: 0.1em 0.5em;
  }
}

.controls {
  width: 100%;
  min-height: 2em;
  
  display: flex;
  flex-direction: row;
  align-items: stretch;
  
  border-top: 1px solid #1e2937;
}

.controls .first { flex-grow: 1; }
.controls .previous { flex-grow: 3; }
.controls .keyframeInfo { padding: 0 0.5em; flex-grow: 1; }
.controls .next { flex-grow: 3; }
.controls .last { flex-grow: 1; }

.controls .first, .controls .previous { border-right: 1px solid #1e2937; }
.controls .next, .controls .last { border-left: 1px solid #1e2937; }

.controls button {
  background: white;
  color: #1e2937;
  border: none;
  cursor: pointer;
  
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 0.25em;
  
  transition: color 0.2s ease, background 0.2s ease;
}

.controls button[disabled] {
  cursor: not-allowed;
  color: #737373;
  background: #e3e3e3;
}

.controls button:not([disabled]):hover {
  background: #f0f0f0;
}

.controls button svg {
  width: 1.2em;
  height: 1.2em;
}

.controls .keyframeInfo {
  background: white;
  display: inline-flex;
  align-items: center;
  justify-content: space-around;
}
    
.wrapper {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.wrapper img, .wrapper svg {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
}
`;

      const darkModeStyle = `
.layout {    
  border: 1px solid #e5e7ea;
  color: #e5e7ea;
}

.header {
  background: #1e2937;
  border-bottom: 1px solid #e5e7ea;
}

.header .shareButton {
  color: #e5e7ea;
}

.header .sharePopup {  
  background: #1e2937;
  color: #e5e7ea;
  border-radius: 8px;
  border: 1px solid #e5e7ea;
  box-shadow: 0 10px 15px -3px rgb(255 255 255 / 0.1), 0 4px 6px -4px rgb(255 255 255 / 0.1);
}

.header .sharePopup button {
  background: #333f4e;
  color: #e5e7ea;
}

.controls {    
  border-top: 1px solid #e5e7ea;
}

.controls .first, .controls .previous { border-right: 1px solid #e5e7ea; }
.controls .next, .controls .last { border-left: 1px solid #e5e7ea; }

.controls button {
  background: #1e2937;
  color: #e5e7ea;
}

.controls button[disabled] {
  color: #595f66;
  background: #1e2937;
}

.controls button:not([disabled]):hover {
  background: #2f3d4e;
}

.controls .keyframeInfo {
  background: #1e2937;
}
`;

      let finalStyle = baseLightModeStyle;
      if (this.theme === "system") {
        finalStyle += `
@media (prefers-color-scheme: dark) {
${darkModeStyle}
}`;
      } else if (this.theme === "dark") {
        finalStyle += darkModeStyle;
      }

      style.textContent = finalStyle;
      this.shadowRoot.append(style);

      this.log(`Created styles successfully for theme "${this.theme}" ✅`);
    }

    async readAndDecodeConfig() {
      this.log(`Reading and decoding Pan'n'Zoom export...`);

      // We prefer a data export URL
      const exportUrl = this.dataset.exportUrl;
      const exportInlined = this.dataset.exportInlined;

      let rawConfigJson;

      if (exportUrl) {
        this.log("Export URL is given.");
        const url = normalizeExportUrl(exportUrl);

        this.log(`Trying to fetch data from: ${url.href}`);
        try {
          rawConfigJson = await window
            .fetch(url.href)
            .then(async (result) => await result.text());
        } catch (e) {
          throw this.error(`Loading data from export URL failed: ${e}`);
        }
      } else if (exportInlined) {
        try {
          rawConfigJson = base64ToUtf8(exportInlined);
        } catch (e) {
          throw this.error(`Error while decoding raw config: ${e}`);
        }
      } else {
        throw this.error(
          "Neither 'data-export-url' nor 'data-export-inlined' attributes were set.",
        );
      }

      try {
        this.export = JSON.parse(rawConfigJson);
        if (Array.isArray(this.export?.projects)) {
          if (this.export.projects.length === 0) {
            throw new Error("Export did not contain any projects.");
          }

          this.export = this.export.projects[0];
        }
      } catch (e) {
        throw this.error(`Error occurred while parsing JSON string: ${e}`);
      }

      if (typeof this.export !== "object") {
        throw this.error("Config JSON does not represent an object.");
      }

      if (typeof this.export.project !== "object") {
        throw this.error("config.project is not an object.");
      }

      if (typeof this.export.imageDataUrl !== "string") {
        throw this.error("config.imageDataUrl is not a string.");
      }

      if (this.export.project.keyframes.length === 0) {
        throw this.error("The Pan'n'Zoom project does not have any keyframes.");
      }

      this.log("Successfully read and decoded inlined export ✅");
    }

    error(message) {
      const finalMessage = `🐈 Error: ${message}`;
      console.error(finalMessage);
      this.wrapper.innerHTML = finalMessage;
      return new Error(finalMessage);
    }

    log(message) {
      if (this.enableDebugLogs) {
        console.debug(`🐈 ${message}`);
      }
    }
  }

  window.customElements.define(PanNZoomPresentWebComponentTag, PanNZoom);
}

function normalizeExportUrl(rawUrl) {
  let exportUrl = rawUrl;

  if (/^https?:\/\//.test(exportUrl)) {
    exportUrl = new URL(exportUrl);
  } else if (exportUrl.startsWith("/")) {
    exportUrl = new URL(location.origin + exportUrl);
  } else {
    exportUrl = new URL(
      location.origin + location.pathname.replace(/\/$/, "") + "/" + exportUrl,
    );
  }

  return exportUrl;
}

function base64ToUtf8(base64EncodedString) {
  try {
    const binaryData = atob(base64EncodedString);
    const decoder = new TextDecoder("UTF-8");
    return decoder.decode(
      new Uint8Array([...binaryData].map((char) => char.charCodeAt(0))),
    );
  } catch (error) {
    throw new Error(`Error decoding base64: ${error}`);
  }
}

async function decodeImage(src) {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    const loadingWrapper = document.createElement("div");

    image.src = src;

    image.onload = () => {
      loadingWrapper.remove();
      resolve(image);
    };

    image.onerror = (event, source, lineno, colno, error) => {
      loadingWrapper.remove();
      reject(
        new Error(JSON.stringify({ error, source, lineno, colno, event })),
      );
    };

    loadingWrapper.style.display = "block";
    loadingWrapper.style.position = "absolute";
    loadingWrapper.style.left = "0";
    loadingWrapper.style.top = "0";
    loadingWrapper.style.width = "1px";
    loadingWrapper.style.height = "1px";

    loadingWrapper.appendChild(image);
    document.body.appendChild(loadingWrapper);
  });
}

function downloadDataUrlToDisk(dataUrl, name) {
  const downloadElement = document.createElement("a");

  downloadElement.setAttribute("href", dataUrl);
  downloadElement.setAttribute("download", name);

  downloadElement.style.display = "none";
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
}

function downloadDataExportToDisk(dataExport, name) {
  downloadDataUrlToDisk(
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dataExport, null, 4)),
    name + ".pannzoom",
  );
}

function copyTextToClipboard(text) {
  function copyDeprecated() {
    const input = document.createElement("input");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    input.style.opacity = "0.01";
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }

  if (window.navigator) {
    window.navigator.clipboard.writeText(text).catch(() => {
      copyDeprecated();
    });
  } else {
    copyDeprecated();
  }
}
