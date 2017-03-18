// Utils

interface Type<T> extends Function {
    new (...args: any[]): T;
}

// Core

class ResourceMetadata {
    methods: Map<string, MethodMetadata> = new Map<string, MethodMetadata>();
}

interface MethodMetadata {
    path?: string;
    method?: string;
    pathParams?: Array<{ name: string, valueFromIndex: number }>;
    queryParams?: Array<{ name: string, valueFromIndex: number }>;
}

function getResourceMetadata(resourceConstructor: any): ResourceMetadata {
    if (!resourceConstructor.hasOwnProperty('metadata')) {
        resourceConstructor.metadata = new ResourceMetadata();
    }
    return resourceConstructor.metadata;
}

function getMethodMetadata(resourceConstructor: any, propertyKey: string): MethodMetadata {
    const metadata = getResourceMetadata(resourceConstructor);
    if (!metadata.methods.has(propertyKey)) {
        metadata.methods.set(propertyKey, {});
    }

    return metadata.methods.get(propertyKey);
}

function GET(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const metadata = getMethodMetadata(target, propertyKey);
    metadata.method = 'GET';
}

function Path(value: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = getMethodMetadata(target, propertyKey);
        metadata.path = value;
    };
}

function PathParam(name: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const metadata = getMethodMetadata(target, propertyKey);
        metadata.pathParams = metadata.pathParams || [];
        metadata.pathParams.push({ name, valueFromIndex: parameterIndex });
    };
}

function QueryParam(name: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        const metadata = getMethodMetadata(target, propertyKey);
        metadata.queryParams = metadata.queryParams || [];
        metadata.queryParams.push({ name, valueFromIndex: parameterIndex });
    };
}

function buildClient<T>(resourceSpec: Type<T>, baseUrl: string): T {
    const metadata = getResourceMetadata(resourceSpec.prototype);

    console.log(metadata);

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

                console.log(url.toString());

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

// Usage

interface User {
    id: number;
    name: string;
}

class UsersResource {
    @GET
    @Path('/users/{id}')
    getUser(@PathParam('id') id: string, @QueryParam('active') active: string): Promise<User> {
        return null;
    }
}

const client = buildClient(UsersResource, 'http://localhost:8000');

client.getUser('4', 'yes')
    .then((user) => {
        console.log(user);
    })
    .catch((error) => {
        console.error(error);
    });
