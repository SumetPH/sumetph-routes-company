import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { RoutesModule } from './routes/routes.module.js';

@Module({
  imports: [RoutesModule],
  controllers: [AppController],
})
export class AppModule {}
