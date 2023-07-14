export interface Project {
  id: string;
  name: string;
}

export interface Suite {
  id: string;
  projects: Project[];
}
