import AppPage from "@/components/AppPage.tsx";
import IonIcon from "@/components/IonIcon.tsx";
import { useCallback, useEffect, useState } from "react";
import { dangerousResetSuiteData } from "@/data/suite.ts";
import { dangerousResetImageStorage } from "@/data/imageStorage.ts";
import { useNavigate } from "react-router-dom";
import { getProjectOverviewLink } from "@/navigation/links.ts";

export function ResetPage() {
  const navigate = useNavigate();
  const [yesIAmSure, setYesIAmSure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetSuite = useCallback(async () => {
    setLoading(true);

    dangerousResetSuiteData();
    await dangerousResetImageStorage();

    setLoading(false);
    setSuccess(true);
  }, []);

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        navigate(getProjectOverviewLink());
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [success, navigate]);

  return (
    <AppPage title={"Reset"}>
      <p className={"max-w-[40rem] mb-8"}>
        Although the app data is only stored in your browser, it's still{" "}
        <b>your</b> data. You can delete <b>your</b> data here, if you want to
        do so.
      </p>

      <p className={"max-w-[40rem] mb-8"}>
        <b>You own your data!</b> Fullstop. <IonIcon name={"happy-outline"} />
      </p>

      <p className={"max-w-[40rem] mb-8"}>
        Don't wonder: After resetting the app data, you will again get the
        standard Pan'n'Zoom project.
      </p>

      {success && (
        <p className={"mb-8 max-w-[40rem] text-green-500"}>
          The app data reset succeeded. You will be redirected to the projects
          overview ...
        </p>
      )}

      <hr className={"mb-8"} />

      <label className="label cursor-pointer justify-start mb-8">
        <input
          type="checkbox"
          checked={yesIAmSure}
          onChange={(e) => {
            setYesIAmSure(e.currentTarget.checked);
          }}
          className="checkbox mr-2"
        />
        <span className="label-text text-lg">
          Yes, I am sure, that I want to delete all my projects and stored
          images.
        </span>
      </label>

      <button
        className={"btn btn-neutral"}
        disabled={!yesIAmSure || loading}
        onClick={() => {
          void resetSuite();
        }}
      >
        {loading && <span className="loading loading-spinner" />}
        <IonIcon name={"trash-outline"} /> Reset app data
      </button>
    </AppPage>
  );
}
