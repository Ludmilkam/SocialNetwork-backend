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

// Почему нету глобального middleware?
// Почему валидация не в middleware?
// Почему нету .prettierrc - набор правил для табуляции? Будем лм его создавать?

// Почему путь не
// prisma/modules/user.prisma
// prisma/schema.prisma
// Почему?
// prisma/schema/schema.prisma
// prisma/schema/user.prisma

