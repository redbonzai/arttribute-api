import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProject, UpdateProject } from './project.dto';
import { JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@Controller({ version: '1', path: 'projects' })
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProject(
    @Body() projectDto: CreateProject,
    @User() user: JwtPayload,
  ) {
    return this.projectService.createProject(projectDto, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateProject(
    @Body() updateProjectDto: UpdateProject,
    @Param('id') projectId: string,
    @User() user: JwtPayload,
  ) {
    return this.projectService.updateProject(
      updateProjectDto,
      projectId,
      user.sub,
    );
  }
}

