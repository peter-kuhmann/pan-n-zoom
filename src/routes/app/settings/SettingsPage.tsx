import AppPage from "@/components/AppPage.tsx";
import useSuite from "@/hooks/useSuite.ts";

export default function SettingsPage() {
  const { suite, update } = useSuite();
  return (
    <AppPage title={"Settings"}>
      <p className={"mb-8 max-w-[40rem]"}>
        Change the default project settings. The settings will be used on
        project creation. Changing these default settings will not affect
        existing projects.
      </p>

      <div className={"flex flex-col gap-8 w-full max-w-[25rem]"}>
        {/* Background color */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-lg">Background color</span>
          </label>
          <input
            type="color"
            value={suite.newProjectDefaultSettings.backgroundColor}
            onInput={(e) => {
              update({
                newProjectDefaultSettings: {
                  ...suite.newProjectDefaultSettings,
                  backgroundColor: e.currentTarget.value,
                },
              });
            }}
            className={"input input-bordered w-full"}
            required
          />
        </div>

        {/* Embed SVGs natively */}
        <label className="label cursor-pointer justify-start">
          <input
            type="checkbox"
            checked={suite.newProjectDefaultSettings.embedSvgNatively}
            onChange={(e) => {
              update({
                newProjectDefaultSettings: {
                  ...suite.newProjectDefaultSettings,
                  embedSvgNatively: e.currentTarget.checked,
                },
              });
            }}
            className="checkbox mr-2"
          />
          <span className="label-text text-lg">
            Enable native SVG embed (use with care)
          </span>
        </label>

        {/* Animation duration */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-lg">Animation duration (ms)</span>
          </label>
          <input
            value={suite.newProjectDefaultSettings.animationDuration}
            onInput={(e) => {
              update({
                newProjectDefaultSettings: {
                  ...suite.newProjectDefaultSettings,
                  animationDuration:
                    e.currentTarget.value === ""
                      ? 0
                      : parseInt(e.currentTarget.value),
                },
              });
            }}
            type="number"
            className={"input input-bordered w-full"}
            placeholder={"Enter animation duration (ms)"}
            required
          />
        </div>

        {/* Animation type */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-lg">Animation type</span>
          </label>
          <select
            className="select select-bordered w-full max-w-xs"
            value={suite.newProjectDefaultSettings.animationType}
            onChange={(e) => {
              update({
                newProjectDefaultSettings: {
                  ...suite.newProjectDefaultSettings,
                  animationType:
                    e.currentTarget.value === "ease" ? "ease" : "linear",
                },
              });
            }}
          >
            <option value={"ease"}>Ease</option>
            <option value={"linear"}>Linear</option>
          </select>
        </div>
      </div>
    </AppPage>
  );
}
