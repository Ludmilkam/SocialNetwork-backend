import { PostCreate } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError } from "../core/repository";
import { Prisma } from "../generated/prisma";

export class PostsRepository {
    async list(): Promise<PostCreate[]> {
        return await prisma.post.findMany();
    }

    async create(data: Prisma.PostCreateInput): Promise<PostCreate> {
        try {
            return await prisma.post.create({
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
