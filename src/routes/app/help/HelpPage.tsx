import AppPage from "@/components/AppPage.tsx";

import Help01 from "@/assets/help-videos/Help-01-ProjectCreation.mp4";
import Help02 from "@/assets/help-videos/Help-02-Presentation.mp4";
import Help03 from "@/assets/help-videos/Help-03-EditorNavigation.mp4";
import Help04 from "@/assets/help-videos/Help-04-EditKeyframe.mp4";
import Help05 from "@/assets/help-videos/Help-05-ReplaceImage.mp4";
import Help06 from "@/assets/help-videos/Help-06-DefaultProjectSettings.mp4";
import Help07 from "@/assets/help-videos/Help-07-ExportImport.mp4";
import Help08 from "@/assets/help-videos/Help-08-OfflineMode.mp4";
import Help09 from "@/assets/help-videos/Help-09-DesktopApp.mp4";

import { useState } from "react";
import IonIcon from "@/components/IonIcon.tsx";

export default function HelpPage() {
  return (
    <AppPage title={"Help"}>
      <p className={"max-w-[40rem] mb-8"}>
        Here you find bite sized help videos!
      </p>

      <p className={"max-w-[40rem] mb-8"}>
        <b>To watch them, you need an active internet connection! 🔌</b>
      </p>

      <hr className={"mb-8"} />

      <HelpVideo heading={"Project creation"} src={Help01} />
      <HelpVideo heading={"Presentation controls"} src={Help02} />
      <HelpVideo heading={"Navigate editor canvas"} src={Help03} />
      <HelpVideo heading={"Edit keyframes"} src={Help04} />
      <HelpVideo heading={"Replace image"} src={Help05} />
      <HelpVideo heading={"Default project settings"} src={Help06} />
      <HelpVideo heading={"Export/Import"} src={Help07} />
      <HelpVideo heading={"Offline mode"} src={Help08} />
      <HelpVideo heading={"Desktop app"} src={Help09} />
    </AppPage>
  );
}

interface HelpVideoProps {
  heading: string;
  src: string;
}

function HelpVideo({ heading, src }: HelpVideoProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={"mb-8"}>
      <h2
        className={"text-2xl mb-4 font-semibold cursor-pointer"}
        onClick={() => {
          setExpanded((previous) => !previous);
        }}
      >
        {expanded ? (
          <IonIcon name={"remove-outline"} />
        ) : (
          <IonIcon name={"add-outline"} />
        )}{" "}
        {heading}
      </h2>

      {expanded && (
        <video
          onPlay={(e) => {
            Array.from(document.querySelectorAll("video"))
              .filter((video) => video !== e.currentTarget)
              .forEach((otherVideo) => {
                otherVideo.pause();
              });
          }}
          className={"w-full max-w-[50rem] rounded-md"}
          src={src}
          controls
        />
      )}
    </div>
  );
}
