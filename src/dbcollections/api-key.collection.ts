export const APIKeyCollection = `
@public
collection ApiKey {
  id: string;
  project: Project;
  value: string;
  created: string;
  
  constructor (id: string, project: Project, value: string, created: string) {
    this.id = id;
    this.project = project;
    this.value = value;
    this.created = created;
  }
}
`;
