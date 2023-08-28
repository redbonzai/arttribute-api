import { Polybase } from '@polybase/client';
import { config } from 'dotenv';

config();

export const db = new Polybase({
  defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/bashy`,
});

export const KhalifaDb = new Polybase({
  defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/khalifa`,
});

export const eddieDb = new Polybase({
  defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/eddie`,
});

export default db;
