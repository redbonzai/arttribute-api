import { Injectable } from '@nestjs/common';
import { PolybaseService } from '~/shared/polybase';
import { v4 } from 'uuid';
import { CreateCertificate, PolybaseCertificate } from './certificate.dto';
import { JwtPayload } from 'jsonwebtoken';
import { Collection, Polybase } from '@polybase/client';
import { map } from 'lodash';
import { CollectionService } from '../collection/collection.service';

interface RequestOptions {
  full?: boolean;
}
@Injectable()
export class CertificateService {
  private certificateCollection: Collection<PolybaseCertificate>;
  private khalifaDb: Polybase;
  private eddieDb: Polybase;

  constructor(
    private polybaseService: PolybaseService,
    private collectionService: CollectionService,
  ) {
    this.certificateCollection = polybaseService
      .app('khalifa')
      .collection<PolybaseCertificate>('Certificate');
    this.khalifaDb = polybaseService.app('khalifa');
    this.eddieDb = polybaseService.app('eddie');
  }

  public async createCertificate(props: {
    certificate: CreateCertificate;
    user: JwtPayload;
  }) {
    const { certificate, user } = props;
    // Web3 -> Create Cert
    return await this.certificateCollection.create([
      v4(), // Id
      user.sub, // User
      certificate.description || 'New Certificate', // Description
      certificate.reference.type, // Reference Type (Item, Collection)
      certificate.reference.id,
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
      switch (certificate.reference.type) {
        case 'item': {
          // Instead of accessing the database, this should interact with the api
          const itemCollection = this.eddieDb.collection('Item');

          const itemRecord = await itemCollection
            .record(certificate.reference.id)
            .get();

          // reference = pick(itemRecord, ['block', 'data']);
          reference = itemRecord.data;
          break;
        }
        case 'collection': {
          // Instead of accessing the database, this should interact with the api
          const collectionCollection = this.khalifaDb.collection('Collection');

          const collectionRecord = await collectionCollection
            .record(certificate.reference.id)
            .get();

          // reference = pick(collectionRecord, ['block', 'data']);
          reference = collectionRecord.data;
          break;
        }
      }
    }
    data.data.reference = reference || certificate.reference;
    // return data;
    return data.data;
  }

  public async getCertificate(
    props: { certificateId: string },
    options?: RequestOptions,
  ) {
    const { certificateId } = props;
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

  public async discoverUserCertificates(
    props: { userId: string },
    options?: RequestOptions,
  ) {
    const { userId } = props;
    const res = { collections: [], items: [] };

    // collections
    const collectionRefs =
      await this.collectionService.getCollectionsForUser(userId);

    if (collectionRefs.length !== 0) {
      const collectionIds = map(collectionRefs, 'id');

      for (const collectionId of collectionIds) {
        const { data: certificatesForCollection } =
          await this.certificateCollection
            .where('reference.type', '==', 'collection')
            .where('reference.id', '==', collectionId)
            .get();

        if (certificatesForCollection.length !== 0) {
          map(certificatesForCollection, async (certificate) => {
            res.collections.push(
              await this.resolveCertificate(certificate.toJSON(), options),
            );
          });
        }
      }
    }

    // items
    const { data: itemRefs } = await this.eddieDb
      .collection('Item')
      .where('owner', '==', this.eddieDb.collection('User').record(userId))
      .get()
      .then(({ data }) => ({ data }));

    if (itemRefs.length !== 0) {
      const itemIds = map(
        itemRefs.map((item) => item.data),
        'id',
      );

      for (const itemId of itemIds) {
        const { data: certificatesForItem } = await this.certificateCollection
          .where('reference.type', '==', 'item')
          .where('reference.id', '==', itemId)
          .get();

        if (certificatesForItem.length !== 0) {
          map(certificatesForItem, async (certificate) => {
            res.items.push(
              await this.resolveCertificate(certificate.toJSON(), options),
            );
          });
        }
      }
    }

    return res;
  }

  public async deleteCertificate(props: { id: string }) {
    const { id } = props;
    // Web3 -> Delete Cert (Find a way)
    return this.certificateCollection.record(id).call('del');
  }
}
