import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../app/entities/task.entity';
import { User } from '../app/entities/user.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { APP_GUARD } from '@nestjs/core';
import { RbacGuard } from '@turbovets-taskmgr/auth';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User])],
  providers: [
    TasksService,
    { provide: APP_GUARD, useClass: RbacGuard }, //This is for enabling RBAC globally
  ],
  controllers: [TasksController],
})
export class TasksModule {}
