import { User } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { Prisma } from "@prisma/client";

export class UsersRepository {
    async findUnique(where: Prisma.UserWhereUniqueInput) {
        try {
            return await prisma.user.findUniqueOrThrow({ where });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }
    async findByEmail(email: string): Promise<User> {
        return await this.findUnique({ email });
    }

    async findById(id: number): Promise<User> {
        return await this.findUnique({ id });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        try {
            return await prisma.user.create({
                data,
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.AlreadyExists) {
                throw new AlreadyExistsError();
            }
            throw err;
        }
    }
    async listFavoriteMovies(userId: number) {
        try {
            const res = await prisma.user.findUniqueOrThrow({
                where: { id: userId },
                select: { favouriteMovies: true },
            });
            return res.favouriteMovies;
        } catch (err) {
            if (getErrorCode(err) == ErrorCodes.NotFound)
                throw new NotFoundError();
            throw err;
        }
    }
    async updateById(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        const updatedUser = await prisma.user.update({
            where: { id },
            data,
        });
        return updatedUser;
    }
    async list(): Promise<User[]> {
        return await prisma.user.findMany();
    }
    async deleteById(userId: number): Promise<void> {
        try {
            await prisma.user.delete({ where: { id: userId } });
        } catch (err) {
            if (getErrorCode(err) == ErrorCodes.NotFound)
                throw new NotFoundError();
            throw err;
        }
    }
}
