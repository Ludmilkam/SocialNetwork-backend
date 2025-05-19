import { Post } from "./types";
import { Prisma } from "../generated/prisma";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError } from "../core/repository";
export class PostsRepository {

    async list(): Promise<Post[]> {
        // return await prisma.post.findMany();
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
