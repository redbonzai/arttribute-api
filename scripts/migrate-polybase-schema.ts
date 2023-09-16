import { config } from 'dotenv';
config();

import { ethPersonalSign } from '@polybase/eth';
import { PolybaseService } from '~/shared/polybase';

import { first, map, toPairs, values } from 'lodash';
import * as collections from '~/dbcollections';

const polybaseService = new PolybaseService();

const db = polybaseService.app('arttribute-test');

db.signer((data) => {
  return {
    h: 'eth-personal-sign',
    sig: ethPersonalSign(process.env.PRIVATE_KEY, data),
  };
});

Promise.all(
  map(toPairs(collections), ([key, collection]) => {
    return db
      .applySchema(collection)
      .then((collections) => {
        const name = first(collections).name();
        console.log(`${name} schema successfully applied`);
      })
      .catch((reason) => {
        console.log(`Error applying ${key} schema`);
        console.log(`Reason: ${reason}`);
      });
  }),
);
