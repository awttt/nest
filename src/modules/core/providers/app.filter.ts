import { ArgumentsHost, Catch, HttpException, HttpStatus, Type } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { isObject } from 'lodash';
import { EntityPropertyNotFoundError, QueryFailedError } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

/**
 * 全局过滤器,用于响应自定义异常
 定义一个用于映射异常处理表的属性resExceptions，在这个属性属性里，我们可以设置一些需要转换为HTTP的异常类，并且可以给他设置异常状态码（默认状态码是500）
接下来判断当前抛出的异常对应的异常类是否在我们的映射表中，如果在我们把这个映射对象找出来。如果不在异常映射列表中而且也不是HTTP异常，则直接使用父类的handleUnkownError进行处理
如果本身就是HTTP异常则直接使用父类的方式正常响应即可
如果不是HTTP异常，那么就按映射的状态码来抛出HTTP异常
 */
@Catch()
export class AppFilter<T = Error> extends BaseExceptionFilter<T> {
    protected resExceptions: Array<{ class: Type<Error>; status?: number } | Type<Error>> = [
        { class: EntityNotFoundError, status: HttpStatus.NOT_FOUND },
        { class: QueryFailedError, status: HttpStatus.BAD_REQUEST },
        { class: EntityPropertyNotFoundError, status: HttpStatus.BAD_REQUEST },
    ];

    // eslint-disable-next-line consistent-return
    catch(exception: T, host: ArgumentsHost) {
        const applicationRef =
            this.applicationRef || (this.httpAdapterHost && this.httpAdapterHost.httpAdapter)!;
        // 是否在自定义的异常处理类列表中
        const resException = this.resExceptions.find((item) =>
            'class' in item ? exception instanceof item.class : exception instanceof item,
        );

        // 如果不在自定义异常处理类列表也没有继承自HttpException
        if (!resException && !(exception instanceof HttpException)) {
            return this.handleUnknownError(exception, host, applicationRef);
        }
        let res: string | object = '';
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (exception instanceof HttpException) {
            res = exception.getResponse();
            status = exception.getStatus();
        } else if (resException) {
            // 如果在自定义异常处理类列表中
            const e = exception as unknown as Error;
            res = e.message;
            if ('class' in resException && resException.status) {
                status = resException.status;
            }
        }
        const message = isObject(res)
            ? res
            : {
                  statusCode: status,
                  message: res,
              };
        applicationRef!.reply(host.getArgByIndex(1), message, status);
    }
}
