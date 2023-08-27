import { Web3Storage } from 'web3.storage';

function getAccessToken() {
  // return process.env.WEB3STORAGE_TOKEN;
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFBMEY4NGEwNTA4ODc1N0VCMTA5MWIxODQ3QTI2RjZGQzI3NTQwMDciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTI2OTAzNzgzMDksIm5hbWUiOiJBcnR0cmlidXRlIn0.otGsSYPppB1XM73_nnx74irQpWLhKCdOgWldJBd3yK8';
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

export default makeStorageClient;
