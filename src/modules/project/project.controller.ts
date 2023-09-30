import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User, UserPayload } from '../auth';
import { CreateProject, UpdateProject } from './project.dto';
import { ProjectService } from './project.service';
import { Authentication } from '../auth/decorators';

@Controller({ version: '1', path: 'projects' })
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Authentication('any')
  @Post()
  async createProject(
    @Body() projectDto: CreateProject,
    @User() user: UserPayload,
  ) {
    return this.projectService.createProject(projectDto, user.sub);
  }

  @Authentication('any')
  @Patch(':id')
  async updateProject(
    @Body() updateProjectDto: UpdateProject,
    @Param('id') projectId: string,
    @User() user: UserPayload,
  ) {
    return this.projectService.updateProject(
      updateProjectDto,
      projectId,
      user.sub,
    );
  }
}

