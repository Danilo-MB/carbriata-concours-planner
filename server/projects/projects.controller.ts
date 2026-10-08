import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Headers } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthService } from '../auth/auth.service';
import type { FeatureEntity, ProjectEntity } from '../storage/storage.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  private async getUserId(authHeader?: string): Promise<string | undefined> {
    if (!authHeader) return undefined;
    try {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const profile = await this.authService.getProfile(token);
      return profile.id;
    } catch {
      return undefined;
    }
  }

  @Get()
  async getAll(@Headers('authorization') auth?: string) {
    const userId = await this.getUserId(auth);
    return this.projectsService.getAll(userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.projectsService.getOne(id);
  }

  @Post()
  async create(@Body() body: Partial<ProjectEntity>, @Headers('authorization') auth?: string) {
    const userId = await this.getUserId(auth);
    return this.projectsService.create(body, userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<ProjectEntity>) {
    return this.projectsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  // Map elements / features endpoints
  @Put(':id/features')
  async syncFeatures(@Param('id') projectId: string, @Body() body: { features: any[] }) {
    return this.projectsService.syncFeatures(projectId, (body.features || []) as FeatureEntity[]);
  }

  @Post(':id/features')
  async addFeature(@Param('id') projectId: string, @Body() feature: Record<string, any>) {
    return this.projectsService.saveFeature(projectId, feature as FeatureEntity);
  }

  @Put(':id/features/:featureId')
  async updateFeature(
    @Param('id') projectId: string,
    @Param('featureId') featureId: string,
    @Body() feature: Record<string, any>
  ) {
    return this.projectsService.saveFeature(projectId, { ...feature, id: featureId } as FeatureEntity);
  }

  @Delete(':id/features/:featureId')
  async deleteFeature(@Param('id') projectId: string, @Param('featureId') featureId: string) {
    return this.projectsService.deleteFeature(projectId, featureId);
  }
}
