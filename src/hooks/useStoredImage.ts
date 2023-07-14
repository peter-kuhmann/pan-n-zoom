import { useEffect, useState } from "react";
import { getStoredImage } from "@/data/imageStorage.ts";

export function useStoredImage(
  imageId?: string | null,
): { loading: true } | { loading: false; dataUrl: string | null } {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (imageId) {
      setLoading(true);
      getStoredImage(imageId)
        .then((dataUrl) => {
          setDataUrl(dataUrl);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [imageId]);

  if (loading) {
    return { loading: true };
  }

  return {
    loading: false,
    dataUrl,
  };
}
