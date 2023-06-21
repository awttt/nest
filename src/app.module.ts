import { Module } from '@nestjs/common';

import { APP_PIPE } from '@nestjs/core';

import { database } from './config';
import { ContentModule } from './modules/content/content.module';
import { AppPipe } from './modules/core/providers/app.pipe';
import { DatabaseModule } from './modules/database/database.module';

@Module({
    imports: [DatabaseModule.forRoot(database), ContentModule],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new AppPipe({
                transform: true,
                forbidUnknownValues: true,
                validationError: { target: false },
            }),
        },
    ],
})
export class AppModule {}
