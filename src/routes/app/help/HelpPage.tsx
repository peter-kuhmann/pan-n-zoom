import AppPage from "@/components/AppPage.tsx";

import HelpProjectCreation from "@/assets/help-videos/Help-ProjectCreation.mp4";
import HelpPresentation from "@/assets/help-videos/Help-Presentation.mp4";
import HelpEditorNavigation from "@/assets/help-videos/Help-EditorNavigation.mp4";
import HelpEditKeyframe from "@/assets/help-videos/Help-EditKeyframe.mp4";
import HelpReplaceImage from "@/assets/help-videos/Help-ReplaceImage.mp4";
import HelpDefaultProjectSettings from "@/assets/help-videos/Help-DefaultProjectSettings.mp4";
import HelpExportImportSuite from "@/assets/help-videos/Help-ExportImportSuite.mp4";
import HelpOfflineMode from "@/assets/help-videos/Help-OfflineMode.mp4";
import HelpDesktopApp from "@/assets/help-videos/Help-DesktopApp.mp4";
import HelpExportSingleProject from "@/assets/help-videos/Help-ExportSingleProject.mp4";
import HelpImportSingleProject from "@/assets/help-videos/Help-ImportSingleProject.mp4";
import HelpFastProjectCreation from "@/assets/help-videos/Help-FastProjectCreation.mp4";
import HelpNativeSvgEmbeds from "@/assets/help-videos/Help-NativeSvgEmbed.mp4";
import HelpEmbed from "@/assets/help-videos/Help-Embed.mp4";

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

      <HelpVideo heading={"Project creation"} src={HelpProjectCreation} />
      <HelpVideo
        heading={"Ultra fast project creation"}
        src={HelpFastProjectCreation}
      />
      <HelpVideo heading={"Presentation controls"} src={HelpPresentation} />
      <HelpVideo
        heading={"Navigate editor canvas"}
        src={HelpEditorNavigation}
      />
      <HelpVideo heading={"Edit keyframes"} src={HelpEditKeyframe} />
      <HelpVideo heading={"Replace image"} src={HelpReplaceImage} />
      <HelpVideo
        heading={"Native SVG Embed / Excalidraw SVGs"}
        src={HelpNativeSvgEmbeds}
      />
      <HelpVideo
        heading={"Default project settings"}
        src={HelpDefaultProjectSettings}
      />
      <HelpVideo
        heading={"Export/Import complete suite"}
        src={HelpExportImportSuite}
      />
      <HelpVideo
        heading={"Export single project"}
        src={HelpExportSingleProject}
      />
      <HelpVideo
        heading={"Import single project"}
        src={HelpImportSingleProject}
      />
      <HelpVideo heading={"Offline mode"} src={HelpOfflineMode} />
      <HelpVideo heading={"Desktop app"} src={HelpDesktopApp} />
      <HelpVideo heading={"Embed in HTML"} src={HelpEmbed} />
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
