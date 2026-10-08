import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [StorageModule, AuthModule, ProjectsModule]
})
export class AppModule {}
