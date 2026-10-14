import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: number;
}

export interface FeatureEntity {
  id: string;
  kind: 'area' | 'line' | 'point';
  name: string;
  categoryId: string;
  notes: string;
  coords: [number, number][];
  createdAt: number;
  images?: string[];
  routeWaypoints?: any[];
  color?: string;
  opacity?: number;
  strokeWidth?: number;
}

export interface ProjectEntity {
  id: string;
  userId?: string;
  name: string;
  description: string;
  location: string;
  template: string;
  center: { lat: number; lng: number; zoom: number };
  basemap: 'satellite' | 'streets';
  categories: any[];
  features: FeatureEntity[];
  hiddenCategoryIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface DataStore {
  users: Record<string, UserEntity>;
  projects: Record<string, ProjectEntity>;
}

let bundledSeedData: DataStore = { users: {}, projects: {} };
try {
  bundledSeedData = require('../../carbriata_data.json');
} catch {
  // fallback
}

@Injectable()
export class StorageService implements OnModuleInit {
  private static memoryStore: DataStore = {
    users: { ...bundledSeedData.users },
    projects: { ...bundledSeedData.projects }
  };

  private store: DataStore = StorageService.memoryStore;

  private filePath: string = process.env.DATA_FILE_PATH || (
    process.env.VERCEL
      ? '/tmp/carbriata_data.json'
      : path.join(process.cwd(), 'carbriata_data.json')
  );

  onModuleInit() {
    this.load();
  }

  private load(): void {
    const mergedStore: DataStore = {
      users: { ...bundledSeedData.users, ...StorageService.memoryStore.users },
      projects: { ...bundledSeedData.projects, ...StorageService.memoryStore.projects }
    };

    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users) Object.assign(mergedStore.users, parsed.users);
        if (parsed.projects) Object.assign(mergedStore.projects, parsed.projects);
      }
    } catch (err) {
      console.warn('Could not read runtime storage file', err);
    }

    this.store = mergedStore;
    StorageService.memoryStore = mergedStore;
  }

  private save(): void {
    try {
      StorageService.memoryStore = this.store;
      fs.writeFileSync(this.filePath, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not persist storage file', err);
    }
  }

  // Users
  findUserByEmail(email: string): UserEntity | undefined {
    const clean = email.toLowerCase().trim();
    return Object.values(this.store.users).find((u) => u.email.toLowerCase() === clean);
  }

  findUserById(id: string): UserEntity | undefined {
    return this.store.users[id];
  }

  createUser(user: UserEntity): UserEntity {
    this.store.users[user.id] = user;
    this.save();
    return user;
  }

  // Projects
  findProjects(userId?: string): ProjectEntity[] {
    const all = Object.values(this.store.projects);
    if (!userId) return all;
    return all.filter((p) => !p.userId || p.userId === userId);
  }

  findProjectById(id: string): ProjectEntity | undefined {
    return this.store.projects[id] || bundledSeedData.projects[id];
  }

  saveProject(project: ProjectEntity): ProjectEntity {
    this.store.projects[project.id] = {
      ...project,
      updatedAt: Date.now()
    };
    this.save();
    return this.store.projects[project.id];
  }

  deleteProject(id: string): boolean {
    if (this.store.projects[id]) {
      delete this.store.projects[id];
      this.save();
      return true;
    }
    return false;
  }

  // Features within project
  updateProjectFeatures(projectId: string, features: FeatureEntity[]): ProjectEntity | null {
    const project = this.store.projects[projectId];
    if (!project) return null;
    project.features = features;
    project.updatedAt = Date.now();
    this.save();
    return project;
  }

  addOrUpdateFeature(projectId: string, feature: FeatureEntity): ProjectEntity | null {
    const project = this.store.projects[projectId];
    if (!project) return null;
    const idx = project.features.findIndex((f) => f.id === feature.id);
    if (idx >= 0) {
      project.features[idx] = feature;
    } else {
      project.features.push(feature);
    }
    project.updatedAt = Date.now();
    this.save();
    return project;
  }

  deleteFeature(projectId: string, featureId: string): ProjectEntity | null {
    const project = this.store.projects[projectId];
    if (!project) return null;
    project.features = project.features.filter((f) => f.id !== featureId);
    project.updatedAt = Date.now();
    this.save();
    return project;
  }
}
