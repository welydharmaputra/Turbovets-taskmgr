// apps/api/src/app/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../app/entities/user.entity';
import { Organization } from '../app/entities/organization.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'] ?? 'dev_secret',
      signOptions: { expiresIn: process.env['JWT_EXPIRES'] ?? '1h' },
    }),
    TypeOrmModule.forFeature([User, Organization]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule], // so other modules can inject JwtService if needed
})
export class AuthModule {}
