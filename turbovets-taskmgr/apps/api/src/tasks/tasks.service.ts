import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../app/entities/task.entity';
import { User } from '../app/entities/user.entity';
import { Role, TaskStatus } from '@turbovets-taskmgr/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasks: Repository<Task>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  private ensureCanWrite(role: Role) {
    if (role === Role.VIEWER) throw new ForbiddenException('Viewer is read-only');
  }

  list(orgId: string) {
    return this.tasks.find({
      where: { organization: { id: orgId } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(user: { sub: string; orgId: string; role: Role }, input: { title: string; description?: string; category?: string }) {
    this.ensureCanWrite(user.role);
    const owner = await this.users.findOneByOrFail({ id: user.sub });
    const task = this.tasks.create({
      title: input.title,
      description: input.description,
      category: input.category,
      status: TaskStatus.TODO,
      owner,
      organization: { id: user.orgId } as any,
    });
    return this.tasks.save(task);
  }

  async update(user: { orgId: string; role: Role }, id: string, patch: Partial<Task>) {
    this.ensureCanWrite(user.role);
    const task = await this.tasks.findOne({ where: { id } });
    if (!task || task.organization.id !== user.orgId) throw new NotFoundException();
    Object.assign(task, patch);
    return this.tasks.save(task);
  }

  async remove(user: { orgId: string; role: Role }, id: string) {
    this.ensureCanWrite(user.role);
    const task = await this.tasks.findOne({ where: { id } });
    if (!task || task.organization.id !== user.orgId) throw new NotFoundException();
    await this.tasks.delete(id);
    return { deleted: true };
  }
}
