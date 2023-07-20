export async function fileToBase64(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(
          new Error(
            "Got ArrayBuffer instead of string while reading file as data URL",
          ),
        );
      } else {
        resolve(reader.result);
      }
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(file);
  });
}

export async function fileToUTF8String(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(
          new Error(
            "Got ArrayBuffer instead of string while reading file as data URL",
          ),
        );
      } else {
        resolve(reader.result);
      }
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsText(file, "UTF-8");
  });
}
