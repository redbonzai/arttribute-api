import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Collection, Polybase } from '@polybase/client';
import { PolybaseService } from '~/shared/polybase';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { CreateProject, UpdateProject } from './project.dto';

@Injectable()
export class ProjectService {
  db: Polybase;
  projectCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.projectCollection = this.db.collection('Project');
  }

  async createProject(projectDto: CreateProject, userId: string) {
    const id = generateUniqueId();
    const current_time = new Date().toISOString();

    const project = await this.projectCollection.create([
      id,
      this.db.collection('User').record(userId),
      projectDto.name,
      projectDto.url,
      current_time,
      current_time,
    ]);
    return project.data;
  }

  //get user projects
  async getUserProjects(userId: string) {
    const projects = await this.projectCollection
      .where('owner', '==', this.db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return projects;
  }

  //get project by id
  async findOne(id: string) {
    const { data: project } = await this.projectCollection.record(id).get();
    if (project) {
      return project;
    } else {
      throw new NotFoundException('record not found');
    }
  }

  //update project
  async updateProject(
    updateProjectDto: UpdateProject,
    projectId: string,
    userId: string,
  ) {
    const currentProject = await this.findOne(projectId);
    if (currentProject.owner.id !== userId) {
      throw new UnauthorizedException('Unauthorized action');
    }
    const updatedProject = await this.projectCollection
      .record(projectId)
      .call('update', [
        updateProjectDto.name || currentProject.name,
        updateProjectDto.url || currentProject.url,
        new Date().toISOString(),
      ]);
    return updatedProject.data;
  }
}
