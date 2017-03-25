import { Type } from './utils';

export class ResourceMetadata {
  basePath: string;
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

export function getMethodMetadata(resourcePrototype: any, propertyKey: string): MethodMetadata {
  const metadata = getResourceMetadata(resourcePrototype.constructor);
  if (!metadata.methods.has(propertyKey)) {
    metadata.methods.set(propertyKey, {});
  }

  return metadata.methods.get(propertyKey);
}

export function buildClient<T>(resourceConstructor: Type<T>, baseUrl: string): T {
  const metadata = getResourceMetadata(resourceConstructor);

  const constructor = (new Function(`return function ${resourceConstructor.name}(){ }`))() as Type<T>;

  Object.getOwnPropertyNames(resourceConstructor.prototype).forEach((propertyName) => {
    if (metadata.methods.has(propertyName)) {
      const methodMetadata = metadata.methods.get(propertyName);

      const value = function () {
        const args = Array.from(arguments);

        const pathTemplate = metadata.basePath != null
          ? metadata.basePath + methodMetadata.path
          : methodMetadata.path;

        const path = methodMetadata.pathParams.reduce((path, value) => {
          return path.replace(`{${value.name}}`, args[ value.valueFromIndex ]);
        }, pathTemplate);

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
      const descriptor = Object.getOwnPropertyDescriptor(resourceConstructor.prototype, propertyName);
      Object.defineProperty(constructor.prototype, propertyName, descriptor);
    }
  });

  return new constructor();
}
