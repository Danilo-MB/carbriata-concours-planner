import { Controller, Get, Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      status: 'ok',
      service: 'Carbriata Concours & Planning API',
      version: '1.0.0',
      timestamp: Date.now()
    };
  }
}

@Module({
  imports: [StorageModule, AuthModule, ProjectsModule],
  controllers: [AppController]
})
export class AppModule {}
