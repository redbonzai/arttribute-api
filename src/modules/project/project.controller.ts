import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, User, UserPayload } from '../auth';
import { CreateProject, UpdateProject } from './project.dto';
import { ProjectService } from './project.service';

@Controller({ version: '1', path: 'projects' })
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProject(
    @Body() projectDto: CreateProject,
    @User() user: UserPayload,
  ) {
    return this.projectService.createProject(projectDto, user.sub);
  }

  @UseGuards(JwtAuthGuard)
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
