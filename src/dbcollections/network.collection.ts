export const NetworkCollection = `
@public 
collection Network{
  id: string;
  name:string;
  rpcUrl: string;
  chainId: string;
  currency: string;
  endpoint: string;
  created: string;
  updated: string;
  
  //TO DO: createdBy: Admin
  //TO DO: reviewer: Admin

  @index(name, chainId, currency);

  constructor(id: string, name:string, rpcUrl: string, chainId: string, currency:string, endpoint:string, created:string, updated: string){
    this.id = id;
    this.name = name;
    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
    this.currency = currency;
    this.endpoint = endpoint;
    this.created = created;
    this.updated = updated;
  }
}
`;
