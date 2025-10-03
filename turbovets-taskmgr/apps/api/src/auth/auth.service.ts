import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../app/entities/user.entity';
import { JwtClaims } from '@turbovets-taskmgr/data';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService
  ) {}

  async validateAndLogin(email: string, password: string) {
    // 1) Load the organization relation OR use an organizationId column if you have one
    const user = await this.users.findOne({
      where: { email },
      relations: { organization: true },    // load org relation (if any)
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // 2) Resolve orgId from relation or column
    const orgId =
      (user as any).organizationId ?? user.organization?.id; // support both shapes
    if (!orgId) {
      // If seed didn’t connect the user to an org, fail early
      throw new UnauthorizedException('User is not in an organization');
    }

    // 3) Build claims
    const payload: JwtClaims = {
      sub: user.id,
      email: user.email,
      orgId,
      role: user.role as JwtClaims['role'],
    };

    // 4) Sign with the SAME secret configured in JwtModule
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }
}
