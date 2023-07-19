import EditProjectTab from "@/components/project/tabs/EditProjectTab.tsx";
import useProject from "@/hooks/useProject.ts";
import { useParams } from "react-router-dom";

export default function EditProjectSettingsTab() {
  const { project, update } = useProject(useParams().projectId);
  if (!project) {
    return <>Project could not be found</>;
  }

  return (
    <EditProjectTab title={"Settings"}>
      <div className={"flex flex-col gap-4 -mt-4"}>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-sm">Project name</span>
          </label>
          <input
            value={project.name}
            onInput={(e) => {
              update({ name: e.currentTarget.value });
            }}
            type="text"
            className={"input input-bordered w-full"}
            placeholder={"Enter project name"}
            required
          />
        </div>

        <label className="label cursor-pointer">
          <input
            type="checkbox"
            checked={project.embedSvgNatively}
            onChange={(e) => {
              update({ embedSvgNatively: e.currentTarget.checked });
            }}
            className="checkbox mr-2"
          />
          <span className="label-text">
            Enable native SVG embed (use with care)
          </span>
        </label>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-sm">Background color</span>
          </label>
          <input
            type="color"
            value={project.backgroundColor}
            onInput={(e) => {
              update({
                backgroundColor: e.currentTarget.value,
              });
            }}
            className={"input input-bordered w-full"}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-sm">Animation duration (ms)</span>
          </label>
          <input
            value={project.animationDuration}
            onInput={(e) => {
              update({
                animationDuration: parseInt(e.currentTarget.value),
              });
            }}
            type="number"
            className={"input input-bordered w-full"}
            placeholder={"Enter animation duration (ms)"}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-sm">Animation type</span>
          </label>
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => {
              update({
                animationType:
                  e.currentTarget.value === "ease" ? "ease" : "linear",
              });
            }}
          >
            <option value={"ease"} selected={project.animationType === "ease"}>
              Ease
            </option>
            <option
              value={"linear"}
              selected={project.animationType === "linear"}
            >
              Linear
            </option>
          </select>
        </div>
      </div>
    </EditProjectTab>
  );
}
