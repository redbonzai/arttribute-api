export const ProjectCollection = `
@public
collection Project {
  id: string;
  owner: User;
  name: string;
  url?: string;
  created: string;
  updated: string;
  
  constructor (id: string, owner: User, name: string, created: string) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.created = created;
    this.updated = created;
  }

  updateName (name: string, updated: string) {
    this.name = name;
    this.updated = updated;
  }

  updateUrl (url: string, updated: string) {
    this.url = url;
    this.updated = updated;
  }
}
`;
