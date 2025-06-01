import {
    AuthTokenPayload,
    createUserInput,
    ShowUser,
    ShowUserWithRelations,
    signInInput,
    signUpInput,
    updateUserInput,
    User,
    UserFriend,
} from "./types";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { OtpEmailRepository, UsersRepository } from "./repositories";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { StringValue } from "ms";
import { generate } from "otp-generator";
import { sendMail } from "../core/mailing";
import { Config } from "../core/config";
import ms from "ms";

export class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid credentials!");
    }
}

export class InvalidOtpError extends Error {
    constructor() {
        super("Invalid otp code");
    }
}
export class OtpExpiredError extends Error {
    constructor() {
        super("Otp expired");
    }
}

export class UserAlreadyExistsError extends Error {
    constructor() {
        super("User with that email already exists");
    }
}

export class OtpGenerationForbidden extends Error {
    constructor() {
        super("You cant generate otp token if you have already registered");
    }
}

export class UserNotFoundError extends Error {
    constructor(findOption: string) {
        super(`User with ${findOption} wasn't found`);
    }
}

export class PostNotFoundError extends Error {
    constructor() {
        super("Post not found");
    }
}

export class NotAllowed extends Error {
    constructor() {
        super("It`s not your post. You can`t delete it.");
    }
}

export class UsersService {
    private usersRepo: UsersRepository;
    private otpRepo: OtpEmailRepository;
    private hashSalt: number;

    constructor() {
        this.usersRepo = new UsersRepository();
        this.otpRepo = new OtpEmailRepository();
        this.hashSalt = 10;
    }

    private async withHashedPassword<T>(
        data: T & { password: string }
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
            if (err instanceof NotFoundError)
                throw new InvalidCredentialsError();
            throw err;
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
        data: signUpInput
    ): Promise<{ user: ShowUser; token: string }> {
        try {
            var otpWithEmail = await this.otpRepo.findByCodeAndEmail(
                data.otp,
                data.email
            );
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw new InvalidOtpError();
            }
            throw err;
        }
        if (otpWithEmail.expiresAt < new Date()) {
            throw new OtpExpiredError();
        }
        await this.otpRepo.deleteAllForEmail(data.email);
        const userData = { ...data, otp: undefined };
        const user = await this.createUser(
            userData as unknown as createUserInput
        );
        const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_TTL as StringValue,
        });

        return { user, token: token };
    }

    async getUser(userId: number): Promise<ShowUserWithRelations> {
        try {
            const user = await this.usersRepo.getByIdWithPosts(userId);
            return { ...user, password: undefined };
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw new InvalidCredentialsError();
            }
            throw err;
        }
    }

    async updateUser(userId: number, data: updateUserInput) :Promise<User>{
        try {
            return await this.usersRepo.update(userId, data);
        } catch (err) {
            if (err instanceof AlreadyExistsError) {
                throw new UserAlreadyExistsError();
            }
            throw err;
        }
    }

    async listUsers(): Promise<ShowUser[]> {
        const users = await this.usersRepo.list();
        return users.map((user) => ({ ...user, password: undefined }));
    }

    async deletePost(userId: number, postId: number): Promise<void> {
        try {
            const post = await this.usersRepo.deletePost(userId, postId);
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw new PostNotFoundError();
            }
            throw err;
        }
    }

    async allFriends(userId: number): Promise<User[]> {
        const allFriends = await this.usersRepo.getFriendsForUser(userId);
        return allFriends.map((friend) => ({ ...friend }));
    }

    async friendRequests(userId: number): Promise<UserFriend[]> {
        const friendRequests =
            await this.usersRepo.getFriendRequestsForUser(userId);
        return friendRequests.map((request) => ({ ...request }));
    }

    async sendOTP(email: string) {
        let user;
        try {
            user = await this.usersRepo.findByEmail(email);
        } catch (err) {
            if (!(err instanceof NotFoundError)) {
                throw err;
            }
        }
        if (user) {
            throw new OtpGenerationForbidden();
        }
        const otp = generate(Config.OTP_LENGTH);
        const expiresAt = new Date();
        const ONE_MIN_MS = 60000;
        expiresAt.setMinutes(
            expiresAt.getMinutes() + ms(Config.OTP_TTL) / ONE_MIN_MS
        );
        await this.otpRepo.create({ otp, email, expiresAt });
        await sendMail(
            email,
            "Email confirmation",
            `Hi dear user.
            Here is your otp which you can use to confirm your email and continue
            in registration.\n${otp}`
        );
    }
}

export const usersService = new UsersService();
