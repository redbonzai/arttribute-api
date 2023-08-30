import { Injectable } from '@nestjs/common';
import { PolybaseService } from '~/shared/polybase';
import { v4 } from 'uuid';
import { CreateCertificate, PolybaseCertificate } from './certificate.dto';
import { JwtPayload } from 'jsonwebtoken';
import { Collection } from '@polybase/client';
import { first, map, pick } from 'lodash';

interface RequestOptions {
  full?: boolean;
}
@Injectable()
export class CertificateService {
  private certificateCollection: Collection<PolybaseCertificate>;

  constructor(private polybaseService: PolybaseService) {
    this.certificateCollection = polybaseService
      .app('fadhili')
      .collection<PolybaseCertificate>('Certificate');
  }

  public async createCertificate(props: {
    certificate: CreateCertificate;
    user: JwtPayload;
  }) {
    const { certificate, user } = props;
    console.log({ certificate });
    // Web3 -> Create Cert
    return this.certificateCollection.create([
      v4(), // Id
      user.sub, // User
      certificate.description || 'New Certificate', // Description
      [certificate.reference.type, certificate.reference.id], // [type, id]
    ]);
  }

  private async resolveCertificate(
    data: { data: PolybaseCertificate; block: { hash: string } },
    options?: RequestOptions,
  ) {
    const { full = false } = options || {};
    const { data: certificate } = data;
    let reference;
    if (full) {
      switch (certificate.reference[0]) {
        case 'item': {
          // Instead of accessing the database, this should interact with the api
          const itemCollection = this.polybaseService
            .app('eddie')
            .collection('Item');

          const itemRecord = await itemCollection
            .record(certificate.reference[1])
            .get()
            .then(({ data }) => first(data));

          reference = pick(itemRecord, ['block', 'data']);
        }
        case 'collection': {
          // Instead of accessing the database, this should interact with the api
          const collectionCollection = this.polybaseService
            .app('khalifa')
            .collection('Collection');

          const collectionRecord = await collectionCollection
            .record(certificate.reference[1])
            .get();

          reference = pick(collectionRecord, ['block', 'data']);
        }
      }
    }
    data.data.reference = reference || certificate.reference;
    return data;
  }

  public async getCertificate(
    props: { certificateId: string },
    options?: RequestOptions,
  ) {
    const { certificateId } = props;
    console.log({ certificateId });
    const certificateRecord = await this.certificateCollection
      .record(certificateId)
      .get();

    const { block, data } = certificateRecord;

    return this.resolveCertificate({ block, data }, options);
  }

  public async getCertificates({}, options?: RequestOptions) {
    const { data: certificateRecords } = await this.certificateCollection.get();
    return Promise.all(
      map(certificateRecords, (record) =>
        this.resolveCertificate(record.toJSON(), options),
      ),
    );
  }

  public async getCertificatesForUser(
    props: { userId: string },
    options?: RequestOptions,
  ) {
    const { userId } = props;
    const { data: certificateRecords } = await this.certificateCollection
      .where('owner', '==', userId)
      .get();
    return Promise.all(
      map(certificateRecords, (record) =>
        this.resolveCertificate(record.toJSON(), options),
      ),
    );
  }

  public async deleteCertificate(props: { id: string }) {
    const { id } = props;
    // Web3 -> Delete Cert (Find a way)
    return this.certificateCollection.record(id).call('del');
  }
}
