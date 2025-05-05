import { User } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { Prisma } from "../generated/prisma";

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
    async list(): Promise<User[]> {
        return await prisma.user.findMany();
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


}

export class OtpEmailRepository {
    async create(data: Prisma.OtpEmailCreateInput) {
        await prisma.otpEmail.create({ data })
    }
    async findByCodeAndEmail(code: string, email: string) {
        try {
            return await prisma.otpEmail.findUniqueOrThrow({ where: { otp: code, email } })
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    async deleteAllForEmail(email: string) {
        await prisma.otpEmail.deleteMany({ where: { email } })
    }
}
