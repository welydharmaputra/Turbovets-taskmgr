import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { JwtClaims } from '@turbovets-taskmgr/data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // 👈 name MUST match guard
  constructor() {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env['JWT_SECRET'] ?? 'dev_secret', // 👈 same value used to sign
      algorithms: ['HS256'],
      ignoreExpiration: false,
    };
    super(opts);
  }

  validate(payload: JwtClaims) {
    // Optional: sanity-check required claims
    if (!payload?.sub || !payload?.orgId || !payload?.role) {
      throw new UnauthorizedException('Invalid token claims');
    }
    return payload; // becomes req.user
  }
}
