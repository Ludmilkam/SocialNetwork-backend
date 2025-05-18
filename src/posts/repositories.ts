import { Post } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError } from "../core/repository";
import { Prisma } from "../generated/prisma";

export class PostsRepository {
    async getAll() {
        return await prisma.post.findMany({
            include: {
                tags: true, author: true, media: true, _count: { select: { likedBy: true, viewedBy: true } }
            }
        }
        )
    }

    async create(data: Prisma.PostCreateInput): Promise<Post> {
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
