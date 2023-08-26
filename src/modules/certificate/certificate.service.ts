import { Injectable } from '@nestjs/common';
import { PolybaseService } from '~/shared/polybase';
import { v4 } from 'uuid';
import { CreateCertificate } from './certificate.dto';

@Injectable()
export class CertificateService {
  private certificateCollection;

  constructor(private polybaseService: PolybaseService) {
    this.certificateCollection =
      polybaseService.client.collection('Certificate');
  }

  public async createCertificate(props: { certificate: CreateCertificate }) {
    const { certificate } = props;
    console.log({ certificate });
    // Web3 -> Create Cert
    return this.certificateCollection.create([
      v4(), // Id
      'DefaultUser', // User
      'New Certificate', // Description
      ['item', 'DefaultItem'], // [type, id]
    ]);
  }

  public async getCertificate(props: { id: string }) {
    const { id } = props;
    return this.certificateCollection.record(id);
  }

  public async deleteCertificate(props: { id: string }) {
    const { id } = props;
    // Web3 -> Delete Cert (Find a way)
    return this.certificateCollection.record(id).call('del');
  }
}
