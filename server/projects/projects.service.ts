import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FeatureEntity, ProjectEntity, StorageService } from '../storage/storage.service';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(StorageService) private readonly storage: StorageService
  ) {}

  async getAll(userId?: string): Promise<ProjectEntity[]> {
    return this.storage.findProjects(userId);
  }

  async getOne(id: string): Promise<ProjectEntity> {
    const project = await this.storage.findProjectById(id);
    if (!project) throw new NotFoundException(`Proyecto con id "${id}" no encontrado.`);
    return project;
  }

  async create(data: Partial<ProjectEntity>, userId?: string): Promise<ProjectEntity> {
    const id = data.id || 'p_' + Math.random().toString(36).substring(2, 10);
    const now = Date.now();

    const project: ProjectEntity = {
      id,
      userId,
      authorEmail: data.authorEmail,
      authorName: data.authorName,
      websiteUrl: data.websiteUrl,
      name: data.name || 'Nuevo Proyecto',
      description: data.description || '',
      location: data.location || '',
      template: data.template || 'blank',
      center: data.center || { lat: -36.32639, lng: -57.69722, zoom: 16 },
      basemap: data.basemap || 'satellite',
      categories: data.categories || [],
      features: data.features || [],
      hiddenCategoryIds: data.hiddenCategoryIds || [],
      createdAt: now,
      updatedAt: now
    };

    return this.storage.saveProject(project);
  }

  async update(id: string, patch: Partial<ProjectEntity>): Promise<ProjectEntity> {
    const existing = await this.getOne(id);
    const updated: ProjectEntity = {
      ...existing,
      ...patch,
      updatedAt: Date.now()
    };
    return this.storage.saveProject(updated);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const ok = await this.storage.deleteProject(id);
    if (!ok) throw new NotFoundException(`Proyecto "${id}" no encontrado.`);
    return { success: true };
  }

  async restore(id: string): Promise<ProjectEntity> {
    const restored = await this.storage.restoreProject(id);
    if (!restored) throw new NotFoundException(`Proyecto "${id}" no encontrado.`);
    return restored;
  }

  async countActiveProjectsByUser(userId?: string, email?: string): Promise<number> {
    return this.storage.countActiveProjectsByUser(userId, email);
  }

  // Feature operations for map elements
  async syncFeatures(projectId: string, features: FeatureEntity[]): Promise<ProjectEntity> {
    const project = await this.storage.updateProjectFeatures(projectId, features);
    if (!project) throw new NotFoundException(`Proyecto "${projectId}" no encontrado.`);
    return project;
  }

  async saveFeature(projectId: string, feature: FeatureEntity): Promise<ProjectEntity> {
    const project = await this.storage.addOrUpdateFeature(projectId, feature);
    if (!project) throw new NotFoundException(`Proyecto "${projectId}" no encontrado.`);
    return project;
  }

  async deleteFeature(projectId: string, featureId: string): Promise<ProjectEntity> {
    const project = await this.storage.deleteFeature(projectId, featureId);
    if (!project) throw new NotFoundException(`Proyecto "${projectId}" o elemento no encontrado.`);
    return project;
  }

  async getDemoProjectId(): Promise<string> {
    return this.storage.getSetting('demoProjectId', 'i6666hqmv8mdpge');
  }

  async setDemoProjectId(id: string): Promise<void> {
    await this.storage.setSetting('demoProjectId', id);
  }
}
