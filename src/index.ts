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
}

function getMetadata(resourceConstructor: any): ResourceMetadata {
    if (resourceConstructor.metadata == null) {
        resourceConstructor.metadata = new ResourceMetadata();
    }
    return resourceConstructor.metadata;
}

function GET() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = getMetadata(target.constructor);
        if (!metadata.methods.has(propertyKey)) {
            metadata.methods.set(propertyKey, {});
        }
        metadata.methods.get(propertyKey).method = 'GET';
    };
}

function Path(value: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = getMetadata(target.constructor);
        if (!metadata.methods.has(propertyKey)) {
            metadata.methods.set(propertyKey, {});
        }
        metadata.methods.get(propertyKey).path = value;
    };
}

function buildClient<T>(resourceSpec: Type<T>, baseUrl: string): T {
    const metadata = getMetadata(resourceSpec);

    const constructor = (new Function(`return function ${resourceSpec.name}(){ }`))() as Type<T>;

    Object.getOwnPropertyNames(resourceSpec.prototype).forEach((propertyName) => {
        if (metadata.methods.has(propertyName)) {
            const methodMetadata = metadata.methods.get(propertyName);

            const value = function () {
                return fetch(new URL(methodMetadata.path, baseUrl).toString(), {
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
    @GET()
    @Path('/test')
    getUser(): Promise<User> {
        return null;
    }
}

const client = buildClient(UsersResource, 'http://localhost:8000');

client.getUser()
    .then((user) => {
        console.log(user);
    })
    .catch((error) => {
        console.error(error);
    });
