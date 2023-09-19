import { Injectable } from '@nestjs/common';
import { Polybase } from '@polybase/client';

const apps = [
  'arttribute-test',
  'bashy',
  'eddie',
  'fadhili',
  'khalifa',
] as const;
export type PolybaseApp = (typeof apps)[number];

@Injectable()
export class PolybaseService {
  private apps: Record<string, Polybase> = {};
  constructor() {}

  public app(name: string) {
    return (this.apps[name] ||= new Polybase({
      defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/${name}`,
    }));
  }
}
