import { useCallback, useEffect, useMemo, useState } from "react";
import CuteCat from "@/components/cat/CuteCat.tsx";

const SearchParamName = "exportUrl";

function getStartUrlFromSearchParams() {
  const windowUrl = new URL(location.href);
  return windowUrl.searchParams.get(SearchParamName) ?? "";
}

function setExportUrlSearchParam(url: string | null) {
  if (window.history) {
    const windowUrl = new URL(location.href);

    if (url === null) {
      windowUrl.searchParams.delete(SearchParamName);
    } else {
      windowUrl.searchParams.set(SearchParamName, url);
    }

    window.history.replaceState({}, "", windowUrl.href);
  }
}

export default function ViewPage() {
  const [exportUrl, setExportUrl] = useState<string>(
    getStartUrlFromSearchParams(),
  );

  const isValidUrl = useMemo(() => {
    try {
      void new URL(exportUrl);
      return true;
    } catch (e) {
      return false;
    }
  }, [exportUrl]);

  const setExportUrlAndNormalize = useCallback((url: string) => {
    let normalizedUrl = url;
    if (url.startsWith("https://www.dropbox.com")) {
      normalizedUrl = url
        .replace("www.dropbox.com", "dl.dropbox.com")
        .replace("?dl=0", "?dl=1");
    }

    setExportUrl(normalizedUrl);
  }, []);

  useEffect(() => {
    if (isValidUrl) {
      setExportUrlSearchParam(exportUrl);
    } else {
      setExportUrlSearchParam(null);
    }
  }, [exportUrl, isValidUrl]);

  return (
    <div className={"w-full py-8 md:py-16 px-4 md:px-16"}>
      <div className={"w-full max-w-[70rem] mx-auto"}>
        <h1
          className={
            "text-2xl md:text-4xl font-semibold mb-4 md:mb-8 flex gap-4 md:gap-8 items-center"
          }
        >
          <CuteCat className={"w-[3rem] md:w-[5rem] inline"} /> View a
          Pan'n'Zoom Project{" "}
        </h1>
        <div className={"mb-8"}>
          <input
            type="text"
            value={exportUrl}
            onInput={(e) => {
              setExportUrlAndNormalize(e.currentTarget.value);
            }}
            placeholder="Pan'n'Zoom export URL"
            className="input input-bordered w-full max-md:input-sm"
          />

          {exportUrl.length > 0 && !isValidUrl && (
            <div className={"text-red-500 mt-4 text-sm"}>
              Please enter a valid URL.
            </div>
          )}
        </div>

        {exportUrl.length > 0 && isValidUrl ? (
          <div
            className={"w-full"}
            dangerouslySetInnerHTML={{
              __html: `<pan-n-zoom-present data-theme="system" data-canvas-max-height="70vh" data-rounded="8px" data-canvas-aspect-ratio="16/9" data-export-url="${exportUrl}"></pan-n-zoom-present>`,
            }}
          ></div>
        ) : (
          <div>
            In order to view a Pan'n'Zoom project, please enter an export URL.
          </div>
        )}
      </div>
    </div>
  );
}
