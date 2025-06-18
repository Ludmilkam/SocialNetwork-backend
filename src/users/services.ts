import {
    AuthTokenPayload,
    createAlbumInput,
    createUserInput,
    ShowUser,
    ShowUserWithRelations,
    signInInput,
    signUpInput,
    updateAlbumInput,
    updateMeInput,
    User,
} from "./types";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { AlbumRepository, OtpEmailRepository, UsersRepository } from "./repositories";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { StringValue } from "ms";
import { generate } from "otp-generator";
import { sendMail } from "../core/mailing";
import { Config } from "../core/config";
import ms from "ms";
import { PostNotFoundError } from "../posts/services";
import { Album } from "../generated/prisma";

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

export class NotAllowedError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class UsersService {
    private usersRepo: UsersRepository;
    private albumRepo: AlbumRepository;
    private otpRepo: OtpEmailRepository;
    private hashSalt: number;
    private otpTTL: StringValue

    constructor() {
        this.usersRepo = new UsersRepository();
        this.albumRepo = new AlbumRepository()
        this.otpRepo = new OtpEmailRepository();
        this.hashSalt = 10;
        this.otpTTL = Config.OTP_TTL
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
            const newUser = await this.usersRepo.create({ ...userData, username: "" });
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
        const expiresAt = otpWithEmail.created_at.getTime() + ms(this.otpTTL)
        if (new Date().getTime() >= expiresAt) {
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

    async getUser(userId: number) {
        try {
            const user = await this.usersRepo.getByIdWithRelations(userId);
            return { ...user, password: undefined };
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw new InvalidCredentialsError();
            }
            throw err;
        }
    }

    async updateUser(userId: number, data: updateMeInput): Promise<ShowUser> {
        try {
            const user = await this.usersRepo.updateById(userId, data);
            return { ...user, password: undefined };
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw new InvalidCredentialsError();
            }
            throw err;
        }
    }

    // async blockUser(userId: number, blockedUserId: number) {
    //     try {
    //         return this.usersRepo.block(userId, blockedUserId);
    //     } catch (err) {
    //         if (err instanceof NotFoundError) {
    //             throw new PostNotFoundError();
    //         }
    //         throw err;
    //     }
    // }

    async acceptRequest(fromUserId: number, toUserId: number) {
        return this.usersRepo.acceptRequest(fromUserId, toUserId);
    }

    async declineRequest(fromUserId: number, toUserId: number) {
        return this.usersRepo.declineRequest(fromUserId, toUserId);
    }

    async deleteFriend(friendId: number, currentUserId: number) {
        // try both combinations of ids (friendship can be bidirectional)
        try {
            return this.usersRepo.deleteFriend(friendId, currentUserId);
        } catch (err) {
            if (err instanceof NotFoundError) {
                return this.usersRepo.deleteFriend(currentUserId, friendId);
            }
            throw err;
        }
    }

    async createFriendRequest(fromUserId: number, toUserId: number) {
        return this.usersRepo.createFriendRequest(fromUserId, toUserId);
    }

    async listUsers(): Promise<User[]> {
        const users = await this.usersRepo.list();
        return users.map((user) => ({ ...user }));
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

    async friendRequests(userId: number): Promise<User[]> {
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
        const code = generate(Config.OTP_LENGTH);
        await this.otpRepo.create({ code, username: email });
        await sendMail(
            email,
            "Email confirmation",
            `Hi dear user.
            Here is your otp which you can use to confirm your email and continue
            in registration.\n${code}`
        );
    }
    async deleteAlbum(albumId: number, currentUserId: number): Promise<void> {
        const album = await this.albumRepo.findUnique({ id: albumId });

        if (album.profile_id !== currentUserId) {
            throw new NotAllowedError('Album does not belong to current user');
        }

        return this.albumRepo.deleteAlbum(albumId);
    }
    async updateAlbum(albumId: number, currentUserId: number, data: updateAlbumInput): Promise<Album> {
        // First verify the album exists and belongs to the current user
        const album = await this.albumRepo.findUnique({ id: albumId });

        if (album.profile_id !== currentUserId) {
            throw new NotAllowedError('Album does not belong to current user');
        }

        return this.albumRepo.updateAlbum(albumId, data);
    }

    async createAlbum(currentUserId: number, data: createAlbumInput): Promise<Album> {
        return this.albumRepo.createAlbum({ ...data, profile_id: currentUserId });
    }
}

export const usersService = new UsersService();
