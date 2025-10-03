import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Organization } from './entities/organization.entity';
// import { User } from './entities/user.entity';
// import { Task } from './entities/task.entity';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: process.env.DB_PATH ?? './tmp/dev.sqlite',
        autoLoadEntities: true,
        synchronize: true,   // dev only
      }),
    }),

    TasksModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
