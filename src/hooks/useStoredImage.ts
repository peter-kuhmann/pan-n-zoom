import { useEffect, useMemo, useState } from "react";
import { getStoredImage } from "@/data/imageStorage.ts";

export function useStoredImage(
  imageId?: string | null,
): { loading: true } | { loading: false; dataUrl: string | null } {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return useMemo(() => {
    if (loading) return { loading: true };
    return { loading: false, dataUrl };
  }, [dataUrl, loading]);
}
