import { isRunningStandalone } from "@/utils/standalone.ts";

export function getProductPageLink() {
  return isRunningStandalone ? getProjectOverviewLink() : "/";
}

export function getProjectOverviewLink() {
  return "/app";
}

export function getProjectBasePath() {
  return "/app/project";
}

export function getCreateProjectLink() {
  return `${getProjectBasePath()}/create`;
}

export function getProjectEditorLink(projectId: string) {
  return `${getProjectBasePath()}/${projectId}`;
}

export function getProjectEditorSettingsLink(projectId: string) {
  return `${getProjectEditorLink(projectId)}/settings`;
}

export function getProjectEditorEmbedLink(projectId: string) {
  return `${getProjectEditorLink(projectId)}/embed`;
}

export function getProjectPresentLink(projectId: string) {
  return `${getProjectBasePath()}/${projectId}/present`;
}

export function getProjectPresentLinkWithKeyframe(
  projectId: string,
  keyframeId: string,
) {
  return `${getProjectPresentLink(projectId)}/${keyframeId}`;
}

export function getImportLink() {
  return "/app/import";
}
