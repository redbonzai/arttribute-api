import { config } from 'dotenv';
config();

import { ethPersonalSign } from '@polybase/eth';
import { PolybaseService } from '~/shared/polybase';

const polybaseService = new PolybaseService();

const db = polybaseService.app('arttribute-test');

db.signer((data) => {
  return {
    h: 'eth-personal-sign',
    sig: ethPersonalSign(process.env.PRIVATE_KEY, data),
  };
});

const createResponse = db.applySchema(
  `
//Arttribute Schema

@public
collection User {
  // 'id' is unique and required on all collections
  id: string;
  publicKey: string;
  address: string;
  name: string;
  created: string;

  // 'constructor' is called when a new record is
  // created, make sure to assign a value to 'this.id'
  constructor (id: string, publicKey: string, address: string, name: string, created:string) {
    this.id = id;
    this.publicKey = publicKey;
    this.address = address;
    this.name = name;
    this.created = created;
  }
}

//TO DO: collection admin

@public
collection Project {
  id: string;
  owner:User;
  name: string;
  url?: string;
  created: string;
  updated: string;
  
  constructor (id: string, owner: User,name: string, url?: string,  created: string, updated: string) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.url = url;
    this.created = created;
    this.updated = updated;
  }

  update (name: string, url?: string, updated: string) {
    this.name = name;
    this.url = url;
    this.updated = updated;
  }
}

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


@public 
collection License{
  id: string;
  name: string;
  description: string;
  symbol: string;
  family: string;

  @index(name);

  constructor(id: string, name: string, description: string, symbol: string, family: string){
    this.id = id;
    this.name = name;
    this.description = description;
    this.symbol = symbol;
    this.family = family;
  }
}

@public 
collection Item{
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  author: string; 
  owner: User;
  source?: string;
  project?: Project;
  license:{
    name: string;
    reference: License[];
  };
  price?: {
    amount?:number;
    currency?: string;
  };
  needsRequest: boolean;
  created: string;
  updated: string;

  @index(id, title, author);

  constructor(id: string, title: string, description: string, url: string, tags: string[], author: string, owner: User, source?: string, project?:Project, licenseName: string, licenseReference: License[], priceAmount?: number, currency?: string, needsRequest: boolean, created: string, updated: string){
    this.id = id;
    this.title = title;
    this.description = description;
    this.url = url;
    this.tags = tags;
    this.author = author;
    this.owner = owner;
    this.source = source;
    this.project = project;
    this.license={
      name: licenseName,
      reference: licenseReference
    };
    this.price = {
      amount: priceAmount,
      currency: currency
    };
    this.needsRequest = needsRequest;
    this.created = created;
    this.updated = updated;
  }

  update(title: string, description: string, tags: string[], author: string, source: string, licenseName: string, licenseReference: License[], priceAmount?: number, currency?: string, needsRequest: boolean, updated: string){
    this.title = title;
    this.description = description;
    this.tags = tags;
    this.author = author;
    this.source = source;
    this.license={
      name: licenseName,
      reference: licenseReference
    };
    this.needsRequest = needsRequest;
    this.price = {
      amount: priceAmount,
      currency: currency
    };
    this.updated = updated;
  }
}

@public 
collection Collection{
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  items: Item[];
  owner: User;
  project?: Project;
  license:{
    name: string;
    reference: License[];
  };
  price?: {
    amount?:number;
    currency?: string;
  };
  needsRequest: boolean;
  created: string;
  updated: string;

  @index(owner);
  constructor(id: string, title: string, description: string, isPublic: boolean, tags: string[], owner: User, project?: Project, licenseName: string, licenseReference: License[], priceAmount?: number, currency?: string, needsRequest: boolean, created: string, updated: string){
    this.id = id;
    this.title = title;
    this.description = description;
    this.isPublic = isPublic;
    this.tags = tags;
    this.items = [];
    this.owner = owner;
    this.project = project;
    this.license={
      name: licenseName,
      reference: licenseReference
    };
    this.price = {
      amount: priceAmount,
      currency: currency
    };
    this.needsRequest = needsRequest;
    this.created = created;
    this.updated = updated;
  }

  changeVisibility(isPublic: boolean){
    this.isPublic = isPublic;
  }

  addItemToCollection(item: Item, newLicenses?: License[]){
    this.items.push(item);
    if (newLicenses) {
      this.license.reference.push(newLicenses);
    }
  }
  
  removeItemFromCollection(items: Item[], newLicenses: License[]){
    this.items = items;
    this.license.reference = newLicenses;
  }

  del(){
    selfdestruct();
  }
}

@public 
collection PermissionRequest{
  id: string;
  reference: {
    type: string;
    id: string;
  };
  sender: User;
  receiver: User;
  senderNote: string;
  receiverNote?: string;
  accepted: boolean;
  closed: boolean;
  created: string;
  updated: string;
  
  @index(reference.type, reference.id);

  constructor(id: string, referenceType: string, referenceId: string, sender: User, receiver: User, senderNote?: string, accepted: string, closed: string, created: string, updated: string){
    this.id = id;
    this.reference = {
      type: referenceType,
      id: referenceId
    };
    this.sender = sender;
    this.receiver = receiver;
    this.senderNote = senderNote;
    this.accepted = accepted;
    this.closed = closed;
    this.created = created;
    this.updated = updated;
  }
  
  updateRequestStatus( accepted: boolean, closed: boolean, receiverNote?: string, updated:string) {
    this.accepted = accepted;
    this.closed = closed;
    this.receiverNote = receiverNote;
    this.updated = updated;
  }
}

@public
collection Certificate {
  id: string;
  owner: User;
  reference: {
    type: string;
    id: string;
    owner: string;
  };
  description: string;
  slug: string;
  created: string;
  minted: boolean;
  tokenDetails?:string;

  @index(slug, reference.type, reference.id);

  constructor (id: string, owner: User, referenceType: string, referenceId: string, referenceOwner: string,  description: string, slug: string, created: string, minted: boolean) {
    this.id = id;
    this.owner = owner;
    this.reference = {
      type: referenceType,
      id: referenceId,
      owner: referenceOwner
    };
    this.description = description;
    this.slug =slug;
    this.created = created;
    this.minted = minted;
  }

  updateMintedStatus (minted: boolean, tokenDetails:string) {
    this.minted = minted;
    this.tokenDetails = tokenDetails;
  }

  del () {
    selfdestruct();
  }
  
}

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

@public 
collection Payment{
  id: string;
  reference: {
    type: string;
    id: string;
  };
  transactionHash: string;
  sender: User;
  receiver: User;
  amount: number;
  currency: string;
  type: string;
  source?: string;
  project?: Project;
  network: Network;
  created: string;

  @index(reference.type, reference.id, transactionHash);

  constructor(id: string, referenceType: string, referenceId: string, transactionHash:string, sender: User, receiver: User, amount:number, currency:string, type:string,  source?: string, project?: Project, network: Network, created: string){
    this.id = id;
    this.reference = {
      type: referenceType,
      id: referenceId
    };
    this.transactionHash = transactionHash;
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
    this.currency = currency;
    this.type = type;
    this.source = source;
    this.project = project;
    this.network = network;
    this.created = created;
  }

  del () {
    selfdestruct();
  }
}
`,
);
