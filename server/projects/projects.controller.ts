import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  UnauthorizedException
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthService } from '../auth/auth.service';
import type { FeatureEntity, ProjectEntity } from '../storage/storage.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  private async getUser(authHeader?: string): Promise<{ id: string; email: string; name: string; role: string; isAdmin: boolean } | null> {
    if (!authHeader) return null;
    try {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const profile = await this.authService.getProfile(token);
      return profile;
    } catch {
      return null;
    }
  }

  private checkCanEditOrDelete(project: ProjectEntity, user: { id: string; email: string; isAdmin: boolean } | null): boolean {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (project.userId && project.userId === user.id) return true;
    if (project.authorEmail && project.authorEmail.toLowerCase() === user.email.toLowerCase()) return true;
    return false;
  }

  private checkVerified(user: { id: string; email: string; isAdmin: boolean; emailVerified?: boolean } | null) {
    if (!user) {
      throw new UnauthorizedException('Debes iniciar sesión para guardar cambios en la nube.');
    }
    if (!user.isAdmin && !user.emailVerified) {
      throw new ForbiddenException('Debes verificar tu correo electrónico para crear o guardar elementos en la nube.');
    }
  }

  @Get()
  async getAll(@Headers('authorization') auth?: string) {
    const user = await this.getUser(auth);
    return this.projectsService.getAll(user?.id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.projectsService.getOne(id);
  }

  @Post()
  async create(@Body() body: Partial<ProjectEntity>, @Headers('authorization') auth?: string) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    return this.projectsService.create({
      ...body,
      userId: user?.id,
      authorEmail: user?.email,
      authorName: user?.name
    }, user?.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<ProjectEntity>, @Headers('authorization') auth?: string) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    const project = await this.projectsService.getOne(id);
    if (!this.checkCanEditOrDelete(project, user)) {
      throw new ForbiddenException('Solo el administrador o el autor del plano pueden modificarlo.');
    }
    return this.projectsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('authorization') auth?: string) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    const project = await this.projectsService.getOne(id);
    if (!this.checkCanEditOrDelete(project, user)) {
      throw new ForbiddenException('Solo el administrador o el autor del plano pueden eliminarlo.');
    }
    return this.projectsService.delete(id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Headers('authorization') auth?: string) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    const project = await this.projectsService.getOne(id);
    if (!this.checkCanEditOrDelete(project, user)) {
      throw new ForbiddenException('Solo el administrador o el autor del plano pueden restaurarlo.');
    }
    return this.projectsService.restore(id);
  }

  // Feature operations for map elements
  @Put(':id/features')
  async syncFeatures(
    @Param('id') projectId: string,
    @Body() body: { features: any[] },
    @Headers('authorization') auth?: string
  ) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    const project = await this.projectsService.getOne(projectId);
    if (!this.checkCanEditOrDelete(project, user)) {
      throw new ForbiddenException('Solo el administrador o el autor del plano pueden modificarlo.');
    }
    return this.projectsService.syncFeatures(projectId, (body.features || []) as FeatureEntity[]);
  }

  @Post(':id/features')
  async addFeature(
    @Param('id') projectId: string,
    @Body() feature: Record<string, any>,
    @Headers('authorization') auth?: string
  ) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    const project = await this.projectsService.getOne(projectId);
    if (!this.checkCanEditOrDelete(project, user)) {
      throw new ForbiddenException('Solo el administrador o el autor del plano pueden modificarlo.');
    }
    return this.projectsService.saveFeature(projectId, feature as FeatureEntity);
  }

  @Put(':id/features/:featureId')
  async updateFeature(
    @Param('id') projectId: string,
    @Param('featureId') featureId: string,
    @Body() feature: Record<string, any>,
    @Headers('authorization') auth?: string
  ) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    const project = await this.projectsService.getOne(projectId);
    if (!this.checkCanEditOrDelete(project, user)) {
      throw new ForbiddenException('Solo el administrador o el autor del plano pueden modificarlo.');
    }
    return this.projectsService.saveFeature(projectId, { ...feature, id: featureId } as FeatureEntity);
  }

  @Delete(':id/features/:featureId')
  async deleteFeature(
    @Param('id') projectId: string,
    @Param('featureId') featureId: string,
    @Headers('authorization') auth?: string
  ) {
    const user = await this.getUser(auth);
    this.checkVerified(user);
    const project = await this.projectsService.getOne(projectId);
    if (!this.checkCanEditOrDelete(project, user)) {
      throw new ForbiddenException('Solo el administrador o el autor del plano pueden eliminarlo.');
    }
    return this.projectsService.deleteFeature(projectId, featureId);
  }
}
