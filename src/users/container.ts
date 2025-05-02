import { UsersHandlers } from "./handlers";
import { UsersService } from "./services";
import { UsersRepository } from "./repositories";
import { UsersMiddlewares } from "./middlewares";

export class Container {
    handlers: UsersHandlers;
    middlewares: UsersMiddlewares;
    service: UsersService;

    constructor() {
        const usersRepo = new UsersRepository();
        this.service = new UsersService(usersRepo);
        this.handlers = new UsersHandlers(this.service);
        this.middlewares = new UsersMiddlewares();
    }
}

export const container = new Container();