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
