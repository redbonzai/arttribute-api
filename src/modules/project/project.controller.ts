import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { User, UserPayload } from '../auth';
import { CreateProject, PolybaseProject, UpdateProject } from './project.dto';
import { ProjectService } from './project.service';
import { Authentication } from '../auth/decorators';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('projects')
@Controller({ version: '1', path: 'projects' })
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new project',
    type: PolybaseProject,
  })
  @Authentication('any')
  @Post()
  async createProject(
    @Body() projectDto: CreateProject,
    @User() user: UserPayload,
  ) {
    return this.projectService.createProject(projectDto, user.sub);
  }

  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated a project',
    type: PolybaseProject,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
