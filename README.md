# TypeScript WS RS
 
**It's an experiment to test the idea.**
 
Is it possible to build HTTP clients using annotations similar to JAVA WS RS in TypeScript.

## Use

	$ npm install ws-rs
	
## Example

	import { buildClient, GET, Path, PathParam, QueryParam } from 'ws-rs';
    
    interface User {
        id: string;
        name: string;
        active: 'yes' | 'no';
    }
    
    @Path('/users')
    class UsersResource {
        @GET
        @Path('/{id}')
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
	
## Develop
 
### Install dev-dependencies

    $ yarn install
    
### Build library

	$ yarn build:lib
	
### Build and run demo

	$ yarn build:demo
	$ yarn serve:demo
