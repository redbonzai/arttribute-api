import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PolybaseService } from '~/shared/polybase';
import { v4 } from 'uuid';
import { CreateCertificate, PolybaseCertificate } from './certificate.dto';
import { JwtPayload } from 'jsonwebtoken';
import { Collection, Polybase } from '@polybase/client';
import { first, map, pick } from 'lodash';

interface RequestOptions {
  full?: boolean;
}
@Injectable()
export class CertificateService {
  private db: Polybase;
  private khalifaDb: Polybase;
  private eddieDb: Polybase;
  private certificateCollection: Collection<PolybaseCertificate>;
  itemCollection: Collection<any>;
  collectionsCollection: Collection<any>;
  requestCollection: Collection<any>;
  paymentCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.khalifaDb = polybaseService.app('khalifa');
    this.eddieDb = polybaseService.app('eddie');
    this.certificateCollection = this.db.collection('Certificate');
    this.itemCollection = this.db.collection('Item');
    this.collectionsCollection = this.db.collection('Collection');
    this.requestCollection = this.db.collection('PermissionRequest');
    this.paymentCollection = this.db.collection('Payment');
  }

  public async findReference(
    id: string,
    type: string,
  ): Promise<{
    id: string;
    owner: string;
    author: string;
    title: string;
    type: string;
    license: string;
    needsRequest: string;
    price: { amount: number; currency: string };
  }> {
    if (type === 'item') {
      const { data: item } = await this.itemCollection.record(id).get();
      if (item) {
        return {
          id: item.id,
          author: item.author,
          owner: item.owner.id,
          title: item.title,
          type: 'item',
          license: item.license.name,
          needsRequest: item.needsRequest,
          price: item.price,
        };
      } else {
        throw new HttpException(
          'reference record not found',
          HttpStatus.NOT_FOUND,
        );
      }
    } else if (type === 'collection') {
      const { data: collection } = await this.collectionsCollection
        .record(id)
        .get();
      if (collection) {
        return {
          id: collection.id,
          author: collection.author,
          owner: collection.owner.id,
          title: collection.title,
          type: 'collection',
          license: collection.license.name,
          needsRequest: collection.needsRequest,
          price: collection.price,
        };
      } else {
        throw new HttpException(
          'reference record not found',
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      throw new HttpException(
        `reference ${type} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  //For items and collections that needs permission request, check status of permission request
  public async checkPermissionRequestStatus(
    props: { referenceId: string; referenceType: string },
    user: JwtPayload,
  ) {
    const { referenceId, referenceType } = props;
    const { data: permissionRequest } = await this.requestCollection
      .where('reference.id', '==', referenceId)
      .where('reference.type', '==', referenceType)
      .where('sender', '==', this.db.collection('User').record(user.publicKey))
      .get()
      .then(({ data }) => first(data));

    if (permissionRequest) {
      return permissionRequest;
    } else {
      throw new HttpException(
        'Permission request not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  //payment reference
  public async findPaymentReference(
    referenceId: string,
    referenceType: string,
    user: JwtPayload,
  ) {
    const { data: payment } = await this.paymentCollection
      .where('reference.id', '==', referenceId)
      .where('reference.type', '==', referenceType)
      .where('sender', '==', this.db.collection('User').record(user.publicKey))
      .get();

    if (payment.length === 0) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }
  }

  public async createCertificate(props: {
    certificate: CreateCertificate;
    user: JwtPayload;
  }) {
    const { certificate, user } = props;
    const certificateReference = await this.findReference(
      certificate.reference.id,
      certificate.reference.type,
    );

    //if requestor is owner
    if (certificateReference.owner === user.publicKey) {
      throw new HttpException(
        'You are the owner of this item/collection. You cannot create a certificate for your own item/collection',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (certificateReference.needsRequest) {
      const permissionRequest = await this.checkPermissionRequestStatus(
        {
          referenceId: certificate.reference.id,
          referenceType: certificate.reference.type,
        },
        user,
      );
      if (!permissionRequest.accepted) {
        throw new HttpException(
          'Permission request not accepted',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    if (certificateReference.price.amount > 0) {
      await this.findPaymentReference(
        certificate.reference.id,
        certificate.reference.type,
        user,
      );
      console.log('payment amount:', certificateReference.price.amount);
    }

    const certificateId = v4();
    const slug =
      certificateReference.title.toLowerCase() +
      '-by' +
      certificateReference.author.toLowerCase() +
      '-' +
      certificateReference.license +
      '-' +
      certificateId;
    return await this.certificateCollection.create([
      certificateId,
      this.db.collection('User').record(user.publicKey),
      certificate.reference.type, // Reference Type (Item, Collection)
      certificate.reference.id,
      certificate.description || 'New Certificate', // Description
      slug.replace(/\s/g, ''),
      new Date().toISOString(),
      false, // Minted Status
    ]);
    // Web3 -> Create Cert
  }

  public async mintCertificate(props: { certificateId: string }) {
    const { certificateId } = props;
    const tokenId = '1234';
    const updatedItem = await this.itemCollection
      .record(certificateId)
      .call('updateMintedStatus', [true, tokenId]);
    return updatedItem;
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
          // .then(({ data }) => first(data));

          reference = pick(itemRecord, ['block', 'data']);
          break;
        }
        case 'collection': {
          // Instead of accessing the database, this should interact with the api
          const collectionCollection = this.khalifaDb.collection('Collection');

          const collectionRecord = await collectionCollection
            .record(certificate.reference.id)
            .get();

          reference = pick(collectionRecord, ['block', 'data']);
          break;
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

  public async discoverUserCertificates(props: { userId: string }) {
    const { userId } = props;
    const res = { collections: [], items: [] };

    const { data: collections } = await this.collectionsCollection
      .where('owner', '==', this.db.collection('User').record(userId))
      .get();
    // collections
    const collectionRefs = collections;

    if (collectionRefs.length !== 0) {
      const collectionIds = map(collectionRefs, 'id');

      for (const collectionId of collectionIds) {
        const { data: certificatesForCollection } =
          await this.certificateCollection
            .where('reference.type', '==', 'collection')
            .where('reference.id', '==', collectionId)
            .get();

        if (certificatesForCollection.length !== 0) {
          // map(certificatesForCollection, (certificate) => {
          //   res.collections.push(certificate.data);
          // });
          map(certificatesForCollection, async (certificate) => {
            res.collections.push(
              await this.resolveCertificate(certificate.toJSON(), {
                full: false,
              }),
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
          .where('reference.id', '==', 'item')
          .where('reference.type', '==', itemId)
          .get();

        if (certificatesForItem.length !== 0) {
          // map(certificatesForItem, (certificate) => {
          //   res.items.push(certificate.data);
          // });
          map(certificatesForItem, async (certificate) => {
            res.items.push(
              await this.resolveCertificate(certificate.toJSON(), {
                full: false,
              }),
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

