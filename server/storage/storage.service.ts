import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Redis } from '@upstash/redis';

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
  private redis: Redis | null = null;

  private filePath: string = process.env.DATA_FILE_PATH || (
    process.env.VERCEL
      ? '/tmp/carbriata_data.json'
      : path.join(process.cwd(), 'carbriata_data.json')
  );

  onModuleInit() {
    this.initRedis();
    this.load();
  }

  private initRedis(): void {
    const url =
      process.env.STORAGE_REST_API_URL ||
      process.env.STORAGE_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_URL ||
      Object.entries(process.env).find(([k]) => k.endsWith('_REST_API_URL'))?.[1];

    const token =
      process.env.STORAGE_REST_API_TOKEN ||
      process.env.STORAGE_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_TOKEN ||
      Object.entries(process.env).find(([k]) => k.endsWith('_REST_API_TOKEN'))?.[1];

    if (url && token) {
      try {
        this.redis = new Redis({ url, token });
        console.log('✅ Upstash Redis / Vercel KV initialized successfully');
      } catch (err) {
        console.warn('⚠️ Could not initialize Redis client:', err);
      }
    } else {
      console.log('ℹ️ Running with local/memory storage (Upstash Redis environment variables not set)');
    }
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
  async findProjects(userId?: string): Promise<ProjectEntity[]> {
    // If Redis is configured, pull fresh projects from the cloud
    if (this.redis) {
      try {
        const ids = await this.redis.smembers<string[]>('all_project_ids');
        if (Array.isArray(ids) && ids.length > 0) {
          const keys = ids.map((id) => `project:${id}`);
          const fetched = await this.redis.mget<ProjectEntity[]>(...keys);
          for (const p of fetched) {
            if (p && p.id) {
              this.store.projects[p.id] = p;
            }
          }
        }
      } catch (err) {
        console.warn('Redis findProjects error:', err);
      }
    }

    const all = Object.values(this.store.projects);
    if (!userId) return all;
    return all.filter((p) => !p.userId || p.userId === userId);
  }

  async findProjectById(id: string): Promise<ProjectEntity | undefined> {
    // 1. Try local memory / bundled
    const local = this.store.projects[id] || bundledSeedData.projects[id];

    // 2. If Redis is configured, fetch from cloud to ensure freshest version across all serverless containers
    if (this.redis) {
      try {
        const cloudProj = await this.redis.get<ProjectEntity>(`project:${id}`);
        if (cloudProj && cloudProj.id) {
          this.store.projects[id] = cloudProj;
          return cloudProj;
        }
      } catch (err) {
        console.warn(`Redis findProjectById(${id}) error:`, err);
      }
    }

    return local;
  }

  async saveProject(project: ProjectEntity): Promise<ProjectEntity> {
    const record: ProjectEntity = {
      ...project,
      updatedAt: Date.now()
    };

    // Save locally first
    this.store.projects[project.id] = record;
    this.save();

    // Persist to Upstash Redis in the cloud
    if (this.redis) {
      try {
        await Promise.all([
          this.redis.set(`project:${project.id}`, record),
          this.redis.sadd('all_project_ids', project.id)
        ]);
      } catch (err) {
        console.warn(`Redis saveProject(${project.id}) error:`, err);
      }
    }

    return record;
  }

  async deleteProject(id: string): Promise<boolean> {
    let existed = false;
    if (this.store.projects[id]) {
      delete this.store.projects[id];
      this.save();
      existed = true;
    }

    if (this.redis) {
      try {
        await Promise.all([
          this.redis.del(`project:${id}`),
          this.redis.srem('all_project_ids', id)
        ]);
        existed = true;
      } catch (err) {
        console.warn(`Redis deleteProject(${id}) error:`, err);
      }
    }

    return existed;
  }

  // Features within project
  async updateProjectFeatures(projectId: string, features: FeatureEntity[]): Promise<ProjectEntity | null> {
    const project = await this.findProjectById(projectId);
    if (!project) return null;
    project.features = features;
    return this.saveProject(project);
  }

  async addOrUpdateFeature(projectId: string, feature: FeatureEntity): Promise<ProjectEntity | null> {
    const project = await this.findProjectById(projectId);
    if (!project) return null;
    const idx = project.features.findIndex((f) => f.id === feature.id);
    if (idx >= 0) {
      project.features[idx] = feature;
    } else {
      project.features.push(feature);
    }
    return this.saveProject(project);
  }

  async deleteFeature(projectId: string, featureId: string): Promise<ProjectEntity | null> {
    const project = await this.findProjectById(projectId);
    if (!project) return null;
    project.features = project.features.filter((f) => f.id !== featureId);
    return this.saveProject(project);
  }
}
