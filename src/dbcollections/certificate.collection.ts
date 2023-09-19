export const CertificateCollection = `
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
`;
