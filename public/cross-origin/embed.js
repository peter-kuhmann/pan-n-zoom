/**
 * Here is how to use the web component "pan-n-zoom-present":
 *
 *    <pan-n-zoom-present [...attributes]></pan-n-zoom>
 *
 * Required attributes:
 *    - config: Base64(JSON.stringify({ project: {...projectData}, imageDataUrl: "data:..." }))
 *
 * Optional attributes:
 *    - debug: empty or string – If present, it enables debug logs.
 *    - canvasAspectRation: string – CSS aspect ratio (e.g. "16/9")
 *    - canvasMaxHeight: string - CSS max-height value (e.g. 500px)
 *    - rounded: empty or string - CSS border-radius (examples: 'rounded' (uses default 8px), 'rounded="24px"')
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
      this.log("Initializing <pan-n-zoom> tag.");

      this.enableDebugLogs = !!this.dataset.debug;
      this.wrapper = null;
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

      this.log("Creating shadow DOM...");
      this.attachShadow({ mode: "open" });
      this.log("Created shadow DOM successfully ✅");

      this.initStyles();
      this.createLayout();
      this.createWrapper();
      this.createControls();
      this.readAndDecodeConfig().then(() => {
        this.applyStyleConfigs();
      }).then(() => {
        return this.createImage()
      }).then(() => {
        this.setKeyframe(this.export.project.keyframes[0].id);
        this.startWrapperResizeTracking();
        setTimeout(() => {
          this.applyTransitionConfigs();
        }, 150);
      });
    }

    firstKeyframe() {
      if ( this.canPrevious ) {
        this.setKeyframe(0);
      }
    }

    lastKeyframe() {
      if ( this.canNext ) {
        this.setKeyframe(
            this.export.project.keyframes.length - 1
        );
      }
    }

    nextKeyframe() {
      if (this.canNext) {
        this.setKeyframe(this.currentKeyframeIndex + 1);
      }
    }

    previousKeyframe() {
      if (this.canPrevious) {
        this.setKeyframe(this.currentKeyframeIndex - 1);
      }
    }

    setKeyframe(keyframeIndex) {
      this.log(`Set keyframe index to = ${keyframeIndex}`);

      this.currentKeyframeIndex = keyframeIndex;

      if (keyframeIndex >= 0 && keyframeIndex <= this.export.project.keyframes.length-1) {
        this.currentKeyframeIndex = keyframeIndex;
        this.currentKeyframe = this.export.project.keyframes[keyframeIndex];
        this.log("Keyframe found and successfully set ✅");
      } else {
        this.currentKeyframeIndex = 0;
        this.currentKeyframe = this.export.project.keyframes[0];
        this.log("Keyframe not found. Setting current keyframe to first keyframe.");
      }

      this.log("Updating canPrevious and canNext...");
      this.canPrevious = this.currentKeyframeIndex > 0
      this.canNext = this.currentKeyframeIndex < this.export.project.keyframes.length - 1

      this.log(
        `Updated flags canPrevious = ${this.canPrevious} and canNext (${this.canNext}).`,
      );

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

    createLayout() {
      this.log("Creating layout element ...");
      this.layout = document.createElement("div");
      this.layout.classList.add("layout");
      const rounded = this.dataset.rounded;
      if (rounded !== undefined && rounded !== null) {
        this.layout.style.borderRadius = rounded.length === 0 ? "8px" : rounded;
      }
      this.shadowRoot.append(this.layout);
      this.log("Created layout successfully ✅");
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

    createWrapper() {
      this.log("Creating presentation wrapper element...");

      const aspectRatio = this.dataset.canvasAspectRatio;
      const maxHeight = this.dataset.canvasMaxHeight;

      this.wrapper = document.createElement("div");
      this.wrapper.classList.add("wrapper");
      this.wrapper.onclick = () => {
        this.nextKeyframe();
      };

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
      this.firstButton.onclick = () => {
        this.firstKeyframe();
      };
      this.firstButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor" d="M30.71 229.47l188.87-113a30.54 30.54 0 0131.09-.39 33.74 33.74 0 0116.76 29.47v79.05l180.72-108.16a30.54 30.54 0 0131.09-.39A33.74 33.74 0 01496 145.52v221A33.73 33.73 0 01479.24 396a30.54 30.54 0 01-31.09-.39L267.43 287.4v79.08A33.73 33.73 0 01250.67 396a30.54 30.54 0 01-31.09-.39l-188.87-113a31.27 31.27 0 010-53z"/></svg>`;
      this.firstButton.disabled = true
      this.controls.append(this.firstButton);

      this.previousButton = document.createElement("button");
      this.previousButton.classList.add("previous");
      this.previousButton.onclick = () => {
        this.previousKeyframe();
      };
      this.previousButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor"  d="M112 64a16 16 0 0116 16v136.43L360.77 77.11a35.13 35.13 0 0135.77-.44c12 6.8 19.46 20 19.46 34.33v290c0 14.37-7.46 27.53-19.46 34.33a35.14 35.14 0 01-35.77-.45L128 295.57V432a16 16 0 01-32 0V80a16 16 0 0116-16z"/></svg>`;
      this.previousButton.disabled = true
      this.controls.append(this.previousButton);

      this.keyframeInfo = document.createElement("div");
      this.keyframeInfo.classList.add("keyframeInfo");
      this.controls.append(this.keyframeInfo);

      this.nextButton = document.createElement("button");
      this.nextButton.classList.add("next");
      this.nextButton.onclick = () => {
        this.nextKeyframe();
      };
      this.nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor"  d="M400 64a16 16 0 00-16 16v136.43L151.23 77.11a35.13 35.13 0 00-35.77-.44C103.46 83.47 96 96.63 96 111v290c0 14.37 7.46 27.53 19.46 34.33a35.14 35.14 0 0035.77-.45L384 295.57V432a16 16 0 0032 0V80a16 16 0 00-16-16z"/></svg>`;
      this.nextButton.disabled = true
      this.controls.append(this.nextButton);

      this.lastButton = document.createElement("button");
      this.lastButton.classList.add("last");
      this.lastButton.onclick = () => {
        this.lastKeyframe();
      };
      this.lastButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="currentColor"  d="M481.29 229.47l-188.87-113a30.54 30.54 0 00-31.09-.39 33.74 33.74 0 00-16.76 29.47v79.05L63.85 116.44a30.54 30.54 0 00-31.09-.39A33.74 33.74 0 0016 145.52v221A33.74 33.74 0 0032.76 396a30.54 30.54 0 0031.09-.39L244.57 287.4v79.08A33.74 33.74 0 00261.33 396a30.54 30.54 0 0031.09-.39l188.87-113a31.27 31.27 0 000-53z"/></svg>`;
      this.lastButton.disabled = true
      this.controls.append(this.lastButton);

      this.log("Created control elements successfully ✅");
    }

    async createImage() {
      this.log("Creating image element...");
      const image = document.createElement("img");
      image.src = this.export.imageDataUrl;

      await image.decode().then(() => {
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
                svgElement.style.width = "100%";
                svgElement.style.height = "100%";
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
      this.log("Adding <pan-n-zoom> styles...");
      this.style.display = "block";

      const style = document.createElement("style");

      style.textContent = `
.layout {
  width: 100%;
  
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  
  border: 1px solid #1e2937;
  color: #1e2937;
  overflow: hidden;
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
.controls .keyframeInfo { padding: 0 2em; min-width: 5em; }
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
}

@media (prefers-color-scheme: dark) {
  .layout {    
    border: 1px solid #e5e7ea;
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
}
`;
      this.shadowRoot.append(style);

      this.log("Created styles successfully ✅");
    }

    async readAndDecodeConfig() {
      this.log(`Reading and decoding Pan'n'Zoom export...`);

      const rawExport = this.dataset.export;
      if (!rawExport) {
        throw this.error(`Attribute "config" was missing on "pan-n-zoom" tag.`);
      }

      let rawConfigJson;

      try {
        const url = new URL(rawExport)
        rawConfigJson = await window.fetch(url).then(result => result.text())
      } catch (e) {
        this.error(e)
        this.log("Export value is not an URL or fetch failed, trying to parse inlined export.")

        try {
          rawConfigJson = base64ToUtf8(rawExport);
        } catch (e) {
          throw this.error(`Error while decoding raw config: ${e}`);
        }
      }

      try {
        this.export = JSON.parse(rawConfigJson);
        if ( Array.isArray(this.export?.projects) ) {
          if ( this.export.projects.length === 0 ) {
            throw new Error("Export did not contain any projects.")
          }

          this.export = this.export.projects[0]
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
