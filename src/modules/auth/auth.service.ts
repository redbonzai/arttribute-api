import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Collection, Polybase } from '@polybase/client';
import { JwtPayload } from 'jsonwebtoken';
import { first } from 'lodash';
import { sha256 } from 'sha.js';
import { v4 as uuidv4 } from 'uuid';
import { PolybaseService } from '~/shared/polybase';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { getSignerData } from '~/shared/util/getSignerData';

@Injectable()
export class AuthService {
  private readonly db: Polybase;
  private readonly userCollection: Collection<any>;
  private apikeyCollection: Collection<any>;
  private projectCollection: Collection<any>;

  constructor(
    private readonly jwtService: JwtService,
    private polybaseService: PolybaseService,
  ) {
    this.db = polybaseService.app('bashy');
    this.userCollection = this.db.collection('User');
    this.apikeyCollection = this.db.collection('ApiKey');
    this.projectCollection = this.db.collection('Project');
  }

  async authenticate(address: string, message: string, signature: string) {
    try {
      const { recoveredAddress, publicKey } = getSignerData(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Signature does not match!');
      }
      const existingUser = await this.userCollection
        .where('address', '==', address)
        .get();
      if (!first(existingUser.data)?.data) {
        throw new UnauthorizedException('User does not exist!');
      }
      const token = this.jwtService.sign({ address, publicKey });
      return { token, publicKey };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async createKey(userId: string, projectId: string) {
    //check if user is owner of project
    const currentProject = await this.findProject(projectId);
    if (currentProject.owner.id !== userId) {
      throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
    }
    const createdAt = new Date().toISOString();

    const apiKey = this.generate();

    const key = await this.apikeyCollection.create([
      generateUniqueId(),
      this.db.collection('User').record(userId),
      this.db.collection('Project').record(projectId),
      ' ',
      this.hash(apiKey),
      createdAt,
    ]);
    return { data: key.data, apikey: apiKey };
  }

  async getProjectForAPIKey(hashedApiKey: string) {
    const { data: apiKeyRecords } = await this.apikeyCollection
      .where('value', '==', hashedApiKey)
      .limit(1)
      .get();
    const apiKey = first(apiKeyRecords);
    if (!apiKey) {
      throw new NotFoundException('API Key Not found');
    }
    const { data: project } = await this.projectCollection
      .record(apiKey.data.project.id)
      .get();
    if (!project) {
      throw new NotFoundException('Project Not found');
    }
    return project;

    // Get project form API Key

    // const { data: project } = await this.projectCollection.where().get();
    return undefined;
  }

  private generate() {
    // UUID to hex
    const buffer = Buffer.alloc(16);
    uuidv4({}, buffer);
    const key = buffer.toString('base64');

    return key;
  }

  //get project by id
  private async findProject(id: string) {
    const { data: project } = await this.projectCollection.record(id).get();
    if (project) {
      return project;
    } else {
      throw new HttpException('project record not found', HttpStatus.NOT_FOUND);
    }
  }

  hash(val: string) {
    return new sha256().update(val).digest('base64');
  }
}

