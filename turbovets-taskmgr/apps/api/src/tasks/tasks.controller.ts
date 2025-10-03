import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard, Roles } from '@turbovets-taskmgr/auth';
import { Role } from '@turbovets-taskmgr/data';
import { ReqUser } from '../auth/req-user.decorator';

class CreateTaskDto { title!: string; description?: string; category?: string; }
class UpdateTaskDto { title?: string; description?: string; category?: string; status?: string; }

@Controller('tasks')
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private svc: TasksService) {}

  @Get()
  list(@ReqUser() user: any) {
    return this.svc.list(user.orgId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  create(@ReqUser() user: any, @Body() dto: CreateTaskDto) {
    return this.svc.create(user, dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  update(@ReqUser() user: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.svc.update(user, id, dto as any);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  remove(@ReqUser() user: any, @Param('id') id: string) {
    return this.svc.remove(user, id);
  }
}
