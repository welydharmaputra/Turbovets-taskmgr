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

  /**
   * List tasks for an org (scoped by org in the query).
   */
  list(orgId: string) {
    return this.tasks.find({
      where: { organization: { id: orgId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create task; no need to load owner from DB – set relation by id.
   */
  async create(
    user: { sub: string; orgId: string; role: Role },
    input: { title: string; description?: string; category?: string }
  ) {
    this.ensureCanWrite(user.role);

    const task = this.tasks.create({
      title: input.title,
      description: input.description,
      category: input.category,
      status: TaskStatus.TODO,
      owner: { id: user.sub } as User,                 // ← avoid extra SELECT
      organization: { id: user.orgId } as any,
    });

    return this.tasks.save(task);                       // id assigned here
  }

  /**
   * Helper: fetch a task guaranteed to belong to this org.
   */
  private getByIdForOrg(id: string, orgId: string) {
    return this.tasks.findOne({
      where: { id, organization: { id: orgId } },      // ← org scoped in query
      // relations: { organization: true },            // only if you need it afterwards
    });
  }

  /**
   * Update task within the same org; prevent changing org/owner/id.
   */
  async update(user: { orgId: string; role: Role }, id: string, patch: Partial<Task>) {
    this.ensureCanWrite(user.role);

    const task = await this.getByIdForOrg(id, user.orgId);
    if (!task) throw new NotFoundException();

    // prevent privileged fields from being altered
    delete (patch as any).organization;
    delete (patch as any).owner;
    delete (patch as any).id;
    delete (patch as any).createdAt;
    delete (patch as any).updatedAt;

    return this.tasks.save({ ...task, ...patch });
  }

  /**
   * Delete task; scope the delete by org to avoid cross-tenant deletes.
   */
  async remove(user: { orgId: string; role: Role }, id: string) {
    this.ensureCanWrite(user.role);

    const result = await this.tasks.delete({
      id,
      organization: { id: user.orgId } as any,         // ← org scoped delete
    });

    if (!result.affected) throw new NotFoundException();
    return { deleted: true, id };
  }
}
