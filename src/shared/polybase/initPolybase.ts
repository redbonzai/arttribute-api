import { Polybase } from '@polybase/client';
// organize-imports-ignore
import { config } from 'dotenv';
config();

export const db = new Polybase({
  defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/fadhili`,
});
