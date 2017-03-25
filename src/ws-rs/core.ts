import { Type } from './utils';

export class ResourceMetadata {
    methods: Map<string, MethodMetadata> = new Map<string, MethodMetadata>();
}

export interface MethodMetadata {
    path?: string;
    method?: string;
    pathParams?: Array<{ name: string, valueFromIndex: number }>;
    queryParams?: Array<{ name: string, valueFromIndex: number }>;
}

export function getResourceMetadata(resourceConstructor: any): ResourceMetadata {
    if (!resourceConstructor.hasOwnProperty('metadata')) {
        resourceConstructor.metadata = new ResourceMetadata();
    }
    return resourceConstructor.metadata;
}

export function getMethodMetadata(resourceConstructor: any, propertyKey: string): MethodMetadata {
    const metadata = getResourceMetadata(resourceConstructor);
    if (!metadata.methods.has(propertyKey)) {
        metadata.methods.set(propertyKey, {});
    }

    return metadata.methods.get(propertyKey);
}

export function buildClient<T>(resourceSpec: Type<T>, baseUrl: string): T {
    const metadata = getResourceMetadata(resourceSpec.prototype);

    const constructor = (new Function(`return function ${resourceSpec.name}(){ }`))() as Type<T>;

    Object.getOwnPropertyNames(resourceSpec.prototype).forEach((propertyName) => {
        if (metadata.methods.has(propertyName)) {
            const methodMetadata = metadata.methods.get(propertyName);

            const value = function () {
                const args = Array.from(arguments);

                const path = methodMetadata.pathParams.reduce((path, value) => {
                    return path.replace(`{${value.name}}`, args[ value.valueFromIndex ]);
                }, methodMetadata.path);

                const url = new URL(path, baseUrl);

                methodMetadata.queryParams.forEach((value) => {
                    (url as any).searchParams.append(value.name, args[ value.valueFromIndex ]);
                });

                return fetch(url.toString(), {
                    method: methodMetadata.method || 'GET',
                })
                    .then((response) => response.json());
            };

            Object.defineProperty(constructor.prototype, propertyName, {
                writable: true,
                configurable: true,
                enumerable: false,
                value: value,
            });
        } else {
            const descriptor = Object.getOwnPropertyDescriptor(resourceSpec.prototype, propertyName);
            Object.defineProperty(constructor.prototype, propertyName, descriptor);
        }
    });

    return new constructor();
}
