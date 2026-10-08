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

@Injectable()
export class StorageService implements OnModuleInit {
  private store: DataStore = {
    users: {},
    projects: {}
  };

  private filePath: string = process.env.DATA_FILE_PATH || (
    process.env.VERCEL
      ? '/tmp/carbriata_data.json'
      : path.join(process.cwd(), 'carbriata_data.json')
  );

  onModuleInit() {
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.store = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not load storage file, initializing in-memory fallback', err);
    }
  }

  private save(): void {
    try {
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
    return this.store.projects[id];
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
