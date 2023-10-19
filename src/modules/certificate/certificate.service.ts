import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Collection, Polybase } from '@polybase/client';
import { ethers } from 'ethers';
import { concat, first, map } from 'lodash';
import { arttributeCertificateAbi } from '~/shared/abi/ArttributeCertificate';
import { PolybaseService } from '~/shared/polybase';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { getSignerData } from '~/shared/util/getSignerData';
import { UserPayload } from '../auth';
import { CollectionService } from '../collection/collection.service';
import { ItemService } from '../item/item.service';
import { CreateCertificate, PolybaseCertificate } from './certificate.dto';

interface RequestOptions {
  full?: boolean;
}
@Injectable()
export class CertificateService {
  private db: Polybase;
  private certificateCollection: Collection<PolybaseCertificate>;
  itemCollection: Collection<any>;
  collectionCollection: Collection<any>;
  requestCollection: Collection<any>;
  paymentCollection: Collection<any>;

  constructor(
    private polybaseService: PolybaseService,
    private collectionService: CollectionService,
    private itemService: ItemService,
  ) {
    this.db = polybaseService.app(process.env.POLYBASE_APP || 'unavailable');
    this.certificateCollection = this.db.collection('Certificate');
    this.itemCollection = this.db.collection('Item');
    this.collectionCollection = this.db.collection('Collection');
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
        throw new NotFoundException('Reference item does not exist');
      }
    } else if (type === 'collection') {
      const { data: collection } = await this.collectionCollection
        .record(id)
        .get();
      if (collection) {
        const { data: owner } = await this.db
          .collection('User')
          .record(collection.owner.id)
          .get();
        return {
          id: collection.id,
          author: owner.name,
          owner: collection.owner.id,
          title: collection.title,
          type: 'collection',
          license: collection.license.name,
          needsRequest: collection.needsRequest,
          price: collection.price,
        };
      } else {
        throw new NotFoundException('Reference collection does not exist');
      }
    } else {
      throw new NotFoundException(`reference ${type} does not exist`);
    }
  }

  //For items and collections that needs permission request, check status of permission request
  public async checkPermissionRequestStatus(
    props: { referenceId: string; referenceType: string },
    user: UserPayload,
  ) {
    const { referenceId, referenceType } = props;
    const { data: permissionRequest } = await this.requestCollection
      .where('reference.id', '==', referenceId)
      .where('reference.type', '==', referenceType)
      .where('sender', '==', this.db.collection('User').record(user.sub))
      .get()
      .then((result) => {
        const res = first(result.data);
        if (!res) {
          throw new NotFoundException(
            'Permission request not found: This item/collection requires permission request',
          );
        }
        return res;
      });

    if (permissionRequest) {
      return permissionRequest;
    } else {
      throw new NotFoundException(
        'Permission request not found: This item/collection requires permission request',
      );
    }
  }

  //payment reference
  public async findPaymentReference(
    referenceId: string,
    referenceType: string,
    user: UserPayload,
  ) {
    const { data: payment } = await this.paymentCollection
      .where('reference.id', '==', referenceId)
      .where('reference.type', '==', referenceType)
      .where('sender', '==', this.db.collection('User').record(user.sub))
      .get()
      .then((result) => {
        const res = first(result.data);
        if (!res) {
          throw new NotFoundException(
            'Payment not found: This item/collection requires payment',
          );
        }
        return res;
      });
  }

  public async createCertificate(props: {
    certificate: CreateCertificate;
    user: UserPayload;
  }) {
    const { certificate, user } = props;
    const certificateReference = await this.findReference(
      certificate.reference.id,
      certificate.reference.type,
    );

    //if requestor is owner
    if (certificateReference.owner === user.sub) {
      throw new UnauthorizedException(
        'You are the owner of this item/collection. You cannot create a certificate for your own item/collection',
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
        throw new BadRequestException('Permission request not accepted');
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

    const certificateId = generateUniqueId();
    const slug =
      certificateReference.title.toLowerCase() +
      '-by' +
      certificateReference.author.toLowerCase() +
      '-' +
      certificateReference.license +
      '-' +
      user.wallet_address.toLowerCase();
    return await this.certificateCollection.create([
      certificateId,
      this.db.collection('User').record(user.sub),
      certificate.reference.type, // Reference Type (Item, Collection)
      certificate.reference.id,
      certificateReference.owner,
      certificate.description || 'New Certificate', // Description
      slug.replace(/\s/g, ''),
      new Date().toISOString(),
      false, // Minted Status
    ]);
    // Web3 -> Create Cert
  }

  public async mintCertificate(
    props: { certificateId: string },
    message: string,
    signature: string,
    user: UserPayload,
  ) {
    try {
      const { certificateId } = props;
      const { data: certificate } = await this.certificateCollection
        .record(certificateId)
        .get();

      //If ceertificate is already minted
      if (certificate?.minted) {
        throw new UnauthorizedException('Certificate already minted');
      }
      const contractAddress = '0x6A803B8F038554AF34AC73F1C099bd340dcC7026'; //old '0x981a7614afb87Cd0F56328f72660f3FbFa2EF30e';
      const tokenURI =
        'https://bafybeiekhfonwnc7uqot6t3wdu45ncip2bwfor35zizapzre6dijgrklkm.ipfs.w3s.link/cf555ba7-5a62-48ae-91a8-be3cc7a1b60e.jpg';
      const { recoveredAddress, publicKey } = getSignerData(message, signature);
      // if (publicKey !== user.sub) {
      //   throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      // }
      const provider = new ethers.JsonRpcProvider(
        `https://celo-alfajores.infura.io/v3/${process.env.PROJECT_ID}`,
      );

      const privateKey = process.env.MINT_KEY;
      if (!privateKey) {
        throw new Error('Mint Key Unavailable');
      }
      const wallet = new ethers.Wallet(privateKey, provider);

      const contract = new ethers.Contract(
        contractAddress,
        arttributeCertificateAbi,
        wallet,
      );

      const mintCertificateAction = await contract.mintCertificate(
        recoveredAddress,
        1,
        certificateId,
        tokenURI,
      );

      const mintedCertificate = await mintCertificateAction.wait();
      const tokenId = mintCertificateAction;
      const updatedCert = await this.certificateCollection
        .record(certificateId)
        .call('updateMintedStatus', [true, tokenId]);
      return { updatedCert, mintedCertificate, recoveredAddress };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async resolveCertificate(
    data: { data: PolybaseCertificate },
    options?: RequestOptions,
  ) {
    const { full = false } = options || {};
    const { data: certificate } = data;

    let reference;
    if (full) {
      switch (certificate.reference.type) {
        case 'item': {
          // Instead of accessing the database, this should interact with the api
          const itemRecord = await this.itemCollection
            .record(certificate.reference.id)
            .get();

          reference = itemRecord.data;
          break;
        }
        case 'collection': {
          // Instead of accessing the database, this should interact with the api
          const collectionRecord = await this.collectionCollection
            .record(certificate.reference.id)
            .get();

          reference = collectionRecord.data;
          break;
        }
      }
    }
    data.data.reference = reference || certificate.reference;
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

    const { data } = certificateRecord;

    if (!data) {
      throw new Error('Certificate data unavailable');
    }
    return this.resolveCertificate({ data }, options);
  }

  public async getCertificates({}, options?: RequestOptions) {
    const { data: certificateRecords } = await this.certificateCollection.get();
    return Promise.all(
      map(certificateRecords, (record) =>
        this.resolveCertificate(record.toJSON(), options),
      ),
    );
  }

  //get one certificate by unique slug and item/collection data
  public async getCertificateBySlug(
    props: { slug: string },
    options?: RequestOptions,
  ) {
    const { slug } = props;

    const { data: certificateRecord } = await this.certificateCollection
      .where('slug', '==', slug)
      .get()
      .then((result) => {
        const res = first(result.data);
        if (!res) {
          throw new NotFoundException('Certificate not found');
        }
        return res;
      });

    if (!certificateRecord) {
      throw new NotFoundException('Certificate not found');
    }
    //get item/collection data
    const certificate = certificateRecord;
    let reference;
    if (certificate.reference.type === 'item') {
      const { data: itemRecord } = await this.itemCollection
        .record(certificate.reference.id)
        .get();
      reference = itemRecord;
    } else if (certificate.reference.type === 'collection') {
      const { data: collectionRecord } = await this.collectionCollection
        .record(certificate.reference.id)
        .get();
      reference = collectionRecord;
    }
    certificate.reference = reference || certificate.reference;

    return certificateRecord;
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
    const res: {
      collections: PolybaseCertificate[];
      items: PolybaseCertificate[];
    } = {
      collections: [],
      items: [],
    };

    // collections
    const collectionRefs = await this.collectionService.getCollectionsForUser(
      userId,
    );

    if (collectionRefs.length !== 0) {
      const collectionIds = map(collectionRefs, 'id');

      for (const collectionId of collectionIds) {
        const { data: certificatesForCollection } =
          await this.certificateCollection
            .where('reference.type', '==', 'collection')
            .where('reference.id', '==', collectionId)
            .get();

        if (certificatesForCollection.length !== 0) {
          res.collections = concat(
            res.collections,
            await Promise.all(
              map(
                certificatesForCollection,
                async (certificate) =>
                  await this.resolveCertificate(certificate.toJSON(), options),
              ),
            ),
          );
        }
      }
    }

    // items
    const { data: itemRefs } = await this.db
      .collection('Item')
      .where('owner', '==', this.db.collection('User').record(userId))
      .get();
    //   .then(({ data }) => ({ data }));

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
          res.items = concat(
            res.items,
            await Promise.all(
              map(
                certificatesForItem,
                async (certificate) =>
                  await this.resolveCertificate(certificate.toJSON(), options),
              ),
            ),
          );
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
