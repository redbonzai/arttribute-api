import { Injectable } from '@nestjs/common';
import { Polybase } from '@polybase/client';

@Injectable()
export class PolybaseService {
  private db: Polybase;
  constructor() {
    this.db = new Polybase({
      defaultNamespace: `${process.env.POLYBASE_NAMESPACE}/fadhili`,
    });
  }

  public get client() {
    return this.db;
  }
}
