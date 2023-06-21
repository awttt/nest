import { ArgumentMetadata, Injectable, Paramtype, ValidationPipe } from '@nestjs/common';
import merge from 'deepmerge';
import { isObject, omit } from 'lodash';

import { DTO_VALIDATION_OPTIONS } from '../constants';

/**
 * 全局管道,用于处理DTO验证
 */
@Injectable()
export class AppPipe extends ValidationPipe {
    async transform(value: any, metadata: ArgumentMetadata) {
        console.log('==================管道log=========================');
        const { metatype, type } = metadata;
        // 获取要验证的dto类
        const dto = metatype as any;
        // 获取dto类的装饰器元数据中的自定义验证选项
        const options = Reflect.getMetadata(DTO_VALIDATION_OPTIONS, dto) || {};
        // 把当前已设置的选项解构到备份对象
        const originOptions = { ...this.validatorOptions };
        console.log('originOptions', originOptions);
        // 把当前已设置的class-transform选项解构到备份对象
        const originTransform = { ...this.transformOptions };
        // 把自定义的class-transform和type选项解构出来
        const { transformOptions, type: optionsType, ...customOptions } = options;
        console.log('transformOptions', transformOptions);
        console.log('customOptions', customOptions);
        // 根据DTO类上设置的type来设置当前的DTO请求类型,默认为'body'
        const requestType: Paramtype = optionsType ?? 'body';
        console.log('requestType', requestType);
        // 如果被验证的DTO设置的请求类型与被验证的数据的请求类型不是同一种类型则跳过此管道
        if (requestType !== type) return value;

        // 合并当前transform选项和自定义选项
        if (transformOptions) {
            this.transformOptions = merge(this.transformOptions, transformOptions ?? {}, {
                arrayMerge: (_d, s, _o) => s,
            });
        }
        // 合并当前验证选项和自定义选项
        this.validatorOptions = merge(this.validatorOptions, customOptions ?? {}, {
            arrayMerge: (_d, s, _o) => s,
        });

        // 这段代码的含义是将 value 进行处理，如果 value 是对象类型且包含 mimetype 属性，则删除其中的 'fields' 属性；如果 value 不是对象类型，则保留原始值。最终，处理后的结果存储在 toValidate 变量中
        const toValidate = isObject(value)
            ? Object.fromEntries(
                  Object.entries(value as Record<string, any>).map(([key, v]) => {
                      if (!isObject(v) || !('mimetype' in v)) return [key, v];
                      return [key, omit(v, ['fields'])];
                  }),
              )
            : value;
        // 序列化并验证dto对象
        let result = await super.transform(toValidate, metadata);
        console.log('toValidate', toValidate);
        console.log('metadata', metadata);
        console.log('result', result);
        // 如果dto类的中存在transform静态方法,则返回调用进一步transform之后的结果
        if (typeof result.transform === 'function') {
            result = await result.transform(result);
            const { transform, ...data } = result;
            result = data;
        }
        // 重置验证选项
        this.validatorOptions = originOptions;
        // 重置transform选项
        this.transformOptions = originTransform;
        console.log('==================管道log=========================');

        return result;
    }
}
