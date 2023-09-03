import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { KeyDto } from './key.dto';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { PolybaseService } from '~/shared/polybase';
import { v4 as uuidv4 } from 'uuid';
import * as bycrypt from 'bcrypt';
import * as nanoid from 'nanoid';

@Injectable()
export class KeyService {
  db: Polybase;
  apikeyCollection: Collection<any>;
  projectCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.apikeyCollection = this.db.collection('ApiKey');
    this.projectCollection = this.db.collection('Project');
  }

  //get project by id
  async findProject(id: string) {
    const { data: project } = await this.projectCollection.record(id).get();
    if (project) {
      return project;
    } else {
      throw new HttpException('project record not found', HttpStatus.NOT_FOUND);
    }
  }

  async createKey(userId: string, projectId: string) {
    //check if user is owner of project
    const currentProject = await this.findProject(projectId);
    if (currentProject.owner.id !== userId) {
      throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
    }
    const createdAt = new Date().toISOString();
    const genrateprefix = nanoid.customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      7,
    );
    const generatevalue = nanoid.customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      32,
    );
    const keyprefix = genrateprefix();
    const value = generatevalue();
    const hashedValue = await bycrypt.hash(value, 10);

    const key = await this.apikeyCollection.create([
      generateUniqueId(),
      this.db.collection('User').record(userId),
      this.db.collection('Project').record(projectId),
      keyprefix,
      hashedValue,
      createdAt,
    ]);
    return { data: key.data, apikey: `${keyprefix}.${value}` };
  }
}

