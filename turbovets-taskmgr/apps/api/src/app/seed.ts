import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from './entities/organization.entity';
import { User } from './entities/user.entity';
import { Role } from '@turbovets-taskmgr/data';

export async function seedDev(app: INestApplication) {
  const ds = app.get<DataSource>(getDataSourceToken());
  const orgRepo = ds.getRepository(Organization);
  const userRepo = ds.getRepository(User);

  let org = await orgRepo.findOne({ where: { name: 'Acme' } });
  if (!org) org = await orgRepo.save(orgRepo.create({ name: 'Acme' }));

  const existing = await userRepo.findOne({ where: { email: 'owner@demo.com' } });
  if (!existing) {
    await userRepo.save(userRepo.create({
      email: 'owner@demo.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      role: Role.OWNER,
      organization: org,
    }));
    // eslint-disable-next-line no-console
    console.log('Seeded user: owner@demo.com / Password123!');
  }
}
