import { getMethodMetadata, getResourceMetadata } from './core';

export function GET(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = getMethodMetadata(target, propertyKey);
    metadata.method = 'GET';
}

export function POST(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = getMethodMetadata(target, propertyKey);
    metadata.method = 'POST';
}

export function PUT(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = getMethodMetadata(target, propertyKey);
    metadata.method = 'PUT';
}

export function PATCH(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = getMethodMetadata(target, propertyKey);
    metadata.method = 'PATCH';
}

export function DELETE(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = getMethodMetadata(target, propertyKey);
    metadata.method = 'DELETE';
}

export function Path(value: string) {
    return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        if (propertyKey != null) {
            const metadata = getMethodMetadata(target, propertyKey);
            metadata.path = value;
        } else {
            const metadata = getResourceMetadata(target);
            metadata.basePath = value;
        }
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
