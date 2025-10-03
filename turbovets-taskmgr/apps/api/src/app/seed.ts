// apps/api/src/app/seed.ts
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from './entities/organization.entity';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Role, TaskStatus } from '@turbovets-taskmgr/data';

export async function seedDev(app: INestApplication) {
  const ds = app.get<DataSource>(getDataSourceToken());
  const orgRepo = ds.getRepository(Organization);
  const userRepo = ds.getRepository(User);
  const taskRepo = ds.getRepository(Task);

  let org = await orgRepo.findOne({ where: { name: 'Acme' } });
  if (!org) {
    org = await orgRepo.save(orgRepo.create({ name: 'Acme' }));
  }

  let owner = await userRepo.findOne({ where: { email: 'owner@demo.com' }, relations: { organization: true } });
  if (!owner) {
    owner = await userRepo.save(userRepo.create({
      email: 'owner@demo.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      role: Role.OWNER,
      organization: org,
    }));
    console.log('Seeded user: owner@demo.com / Password123!');
  }


  await upsertUser(userRepo, { email: 'viewer@demo.com',  role: Role.VIEWER  }, org);

  const existingTasks = await taskRepo.count({ where: { organization: { id: org.id } } });
  if (existingTasks === 0) {
    await taskRepo.save([
      taskRepo.create({
        title: 'Set up RBAC guards & roles',
        status: TaskStatus.TODO,
        category: 'Security',
        organization: org,
        owner, 
      }),
      taskRepo.create({
        title: 'Build Login page',
        status: TaskStatus.IN_PROGRESS,
        category: 'Frontend',
        organization: org,
        owner,
      }),
      taskRepo.create({
        title: 'Write README (architecture)',
        status: TaskStatus.DONE,
        category: 'Docs',
        organization: org,
        owner,
      }),
    ]);
    console.log('Seeded demo tasks for Acme.');
  }
}

async function upsertUser(
  userRepo: Repository<User>,
  data: { email: string; role: Role },
  org: Organization
): Promise<User> {
  const found = await userRepo.findOne({ where: { email: data.email } });
  if (found) return found;

  return userRepo.save(
    userRepo.create({
      email: data.email,
      passwordHash: await bcrypt.hash('Password123!', 10),
      role: data.role,
      organization: org,
    })
  );
}
