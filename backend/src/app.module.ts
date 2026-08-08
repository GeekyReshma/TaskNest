import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [BoardsModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
