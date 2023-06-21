import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置
 */
// widows
export const database = (): TypeOrmModuleOptions => ({
    charset: 'utf8mb4',
    logging: ['error'],
    type: 'mysql',
    host: 'mysql',
    port: 3306,
    username: 'nest',
    password: '123456',
    database: 'nestplus',
    synchronize: true,
    autoLoadEntities: true,
});

// mac
// export const database = (): TypeOrmModuleOptions => ({
//     charset: 'utf8mb4',
//     logging: ['error'],
//     type: 'mysql',
//     host: '127.0.0.1',
//     port: 5001,
//     username: 'nest',
//     password: '123456',
//     database: 'nestplus',
//     synchronize: true,
//     autoLoadEntities: true,
// });
