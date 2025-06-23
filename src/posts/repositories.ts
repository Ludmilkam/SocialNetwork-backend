import { Post, Tag } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { Prisma } from "../generated/prisma";

export class PostsRepository {
    async getAll(excludeForAuthorId?: number) {
        const options: Prisma.PostFindManyArgs = {
            include: {
                tags: { include: { tag: true } },
                author: { include: { avatars: true, user: true } },
                images: true,
                _count: { select: { likes: true, views: true } },
            },
        };
        if (excludeForAuthorId) {
            options.where = { NOT: { author_id: excludeForAuthorId } };
        }
        return await prisma.post.findMany(options);
    }

    async deletePostForUserById(
        authorId: number,
        postId: number
    ): Promise<void> {
        try {
            await prisma.post.delete({
                where: { id: postId, author_id: authorId },
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
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
    async getAllTags() {
        return await prisma.tag.findMany({});
    }

    async createTag(data: Prisma.TagCreateInput): Promise<Tag> {
        try {
            return await prisma.tag.create({
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
