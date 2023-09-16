export const LicenseCollection = `
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
`;
