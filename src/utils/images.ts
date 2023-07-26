export async function decodeImage(src: string): Promise<HTMLImageElement> {
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
