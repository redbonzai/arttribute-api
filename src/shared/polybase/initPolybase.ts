import { Polybase } from '@polybase/client';
import { config } from 'dotenv';

config();

export const db = new Polybase({
<<<<<<< HEAD
  defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/bashy`,
});

export const KhalifaDb = new Polybase({
=======
>>>>>>> e0db6849982e12e01471ff8aa3953f9c73c77bf6
  defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/khalifa`,
});

export const eddieDb = new Polybase({
  defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/eddie`,
});
