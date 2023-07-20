import { createContext, useContext, useRef } from "react";
import { createStore, type StoreApi } from "zustand";

export type ProjectEditorStoreMode = "view" | "createKeyframe" | "editKeyframe";

export interface ProjectEditorStore {
  mode: ProjectEditorStoreMode;
  activeKeyframeId: string | null;
  highlightedKeyframeId: string | null;
}

export function useCreateProjectEditorStore() {
  return useRef(
    createStore<ProjectEditorStore>(() => ({
      mode: "view",
      activeKeyframeId: null,
      highlightedKeyframeId: null,
    })),
  ).current;
}

const ProjectEditorStoreContext =
  createContext<StoreApi<ProjectEditorStore> | null>(null);

export function ProjectEditorStoreProvider({
  store,
  children,
}: {
  store: StoreApi<ProjectEditorStore>;
  children?: React.ReactNode;
}) {
  return (
    <ProjectEditorStoreContext.Provider value={store}>
      {children}
    </ProjectEditorStoreContext.Provider>
  );
}

export function useProjectEditorStore() {
  const store = useContext(ProjectEditorStoreContext);
  if (!store) throw new Error("ProjectEditorStore not available!");
  return store;
}
