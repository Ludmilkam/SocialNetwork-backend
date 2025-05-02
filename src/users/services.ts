import {
    AuthTokenPayload,
    createUserInput,
    ShowUser,
    signInInput,
    signUpInput,
    User,
} from "./types";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { UsersRepository } from "./repositories";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { StringValue } from "ms";

export class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid credentials!");
    }
}
export class UserAlreadyExistsError extends Error {
    constructor() {
        super("User with that email already exists");
    }
}

export class UserNotFoundError extends Error {
    constructor(findOption: string) {
        super(`User with ${findOption} wasn't found`);
    }
}

export class UsersService {
    private usersRepo: UsersRepository;
    private hashSalt: number;

    constructor(usersRepo: UsersRepository) {
        this.usersRepo = new UsersRepository();
        this.hashSalt = 10;
    }

    private async withHashedPassword<T>(
        data: T & { password: string },
    ): Promise<T & { password: string }> {
        const hashedPassword = await hash(data.password, this.hashSalt);

        return {
            ...data,
            password: hashedPassword,
        };
    }

    async signIn(data: signInInput): Promise<string> {
        let user: User;
        try {
            user = await this.usersRepo.findByEmail(data.email);
        } catch (err) {
            if (err instanceof NotFoundError) throw new InvalidCredentialsError();
            throw err
        }
        const isPasswordValid = await compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }
        const payload: AuthTokenPayload = { uid: user.id };
        const token = sign(payload, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_TTL as StringValue,
        });

        return token;
    }
    async createUser(data: createUserInput): Promise<ShowUser> {
        const userData = await this.withHashedPassword(data);
        try {
            const newUser = await this.usersRepo.create(userData);
            return { ...newUser, password: undefined };
        } catch (err) {
            if (err instanceof AlreadyExistsError) {
                throw new UserAlreadyExistsError();
            }
            throw err;
        }
    }

    async signUp(
        data: signUpInput,
    ): Promise<{ user: ShowUser; token: string }> {
        const user = await this.createUser(data);
        const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_TTL as StringValue,
        });

        return { user, token: token };
    }

    async getUser(userId: number): Promise<ShowUser> {
        try {
            const user = await this.usersRepo.findById(userId);
            return { ...user, password: undefined };
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw new InvalidCredentialsError();
            }
            throw err;
        }
    }

    async listUsers(): Promise<ShowUser[]> {
        const users = await this.usersRepo.list();
        return users.map((user) => ({ ...user, password: undefined }));
    }

}
