import { Injectable } from '@nestjs/common';
import { db } from 'src/shared/polybase/initPolybase';
import { v4 } from 'uuid';

@Injectable()
export class CertificateService {
  private certificateCollection = db.collection('Certificate');

  constructor() {}

  public async createCertificate(props: {}) {
    return this.certificateCollection.create([
      v4(),
      'DefaultUser',
      'New Certificate',
      'DefaultItem',
    ]);
  }

  public async getCertificate(props: { id: string }) {
    const { id } = props;
    return this.certificateCollection.record(id);
  }

  public async deleteCertificate(props: { id: string }) {
    const { id } = props;
    return this.certificateCollection.record(id).call('del');
  }
}
