import { getMethodMetadata } from './core';

export function GET(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = getMethodMetadata(target, propertyKey);
    metadata.method = 'GET';
}

export function Path(value: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = getMethodMetadata(target, propertyKey);
        metadata.path = value;
    };
}

export function PathParam(name: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const metadata = getMethodMetadata(target, propertyKey);
        metadata.pathParams = metadata.pathParams || [];
        metadata.pathParams.push({ name, valueFromIndex: parameterIndex });
    };
}

export function QueryParam(name: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const metadata = getMethodMetadata(target, propertyKey);
        metadata.queryParams = metadata.queryParams || [];
        metadata.queryParams.push({ name, valueFromIndex: parameterIndex });
    };
}
