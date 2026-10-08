import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FeatureEntity, ProjectEntity, StorageService } from '../storage/storage.service';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(StorageService) private readonly storage: StorageService
  ) {}

  getAll(userId?: string): ProjectEntity[] {
    return this.storage.findProjects(userId);
  }

  getOne(id: string): ProjectEntity {
    const project = this.storage.findProjectById(id);
    if (!project) throw new NotFoundException(`Proyecto con id "${id}" no encontrado.`);
    return project;
  }

  create(data: Partial<ProjectEntity>, userId?: string): ProjectEntity {
    const id = data.id || 'p_' + Math.random().toString(36).substring(2, 10);
    const now = Date.now();

    const project: ProjectEntity = {
      id,
      userId,
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

  update(id: string, patch: Partial<ProjectEntity>): ProjectEntity {
    const existing = this.getOne(id);
    const updated: ProjectEntity = {
      ...existing,
      ...patch,
      updatedAt: Date.now()
    };
    return this.storage.saveProject(updated);
  }

  delete(id: string): { success: boolean } {
    const ok = this.storage.deleteProject(id);
    if (!ok) throw new NotFoundException(`Proyecto "${id}" no encontrado.`);
    return { success: true };
  }

  // Feature operations for map elements
  syncFeatures(projectId: string, features: FeatureEntity[]): ProjectEntity {
    const project = this.storage.updateProjectFeatures(projectId, features);
    if (!project) throw new NotFoundException(`Proyecto "${projectId}" no encontrado.`);
    return project;
  }

  saveFeature(projectId: string, feature: FeatureEntity): ProjectEntity {
    const project = this.storage.addOrUpdateFeature(projectId, feature);
    if (!project) throw new NotFoundException(`Proyecto "${projectId}" no encontrado.`);
    return project;
  }

  deleteFeature(projectId: string, featureId: string): ProjectEntity {
    const project = this.storage.deleteFeature(projectId, featureId);
    if (!project) throw new NotFoundException(`Proyecto "${projectId}" o elemento no encontrado.`);
    return project;
  }
}
