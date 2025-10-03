export * from './lib/data';

export enum Role {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    VIEWER = 'Viewer',
  }
  
  export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
  }
  
  export interface JwtClaims {
    sub: string;     // user id
    email: string;
    orgId: string;
    role: Role;
  }
  