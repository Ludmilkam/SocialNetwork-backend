import { Post, UpdatePostInput, Tag } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { Prisma } from "../generated/prisma";

const postInclude = {
    tags: { include: { tag: true } },
    author: { include: { avatars: true, user: true } },
    images: true,
    _count: { select: { likes: true, views: true } },
} as const;

type PostWithRelations = Prisma.PostGetPayload<{
    include: typeof postInclude;
}>;
export class PostsRepository {
    async getAll(excludeForAuthorId?: number): Promise<PostWithRelations[]> {
        const options: Prisma.PostFindManyArgs = {
            include: postInclude,
        };
        if (excludeForAuthorId) {
            options.where = { NOT: { author_id: excludeForAuthorId } };
        }
        return await prisma.post.findMany(options) as PostWithRelations[];
    }

    async deletePostForUserById(
        authorId: number,
        postId: number
    ): Promise<void> {
        try {
            await prisma.post.delete({
                where: { id: postId, author_id: authorId } as any,
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

    async updateByIdAndAuthor(postId: number, authorId: number, data: UpdatePostInput): Promise<Post> {
        const updateData: Prisma.PostUpdateInput = {};

        if (data.title !== undefined) {
            updateData.title = data.title;
        }

        if (data.content !== undefined) {
            updateData.content = data.content;
        }

        // Handle images update (replace existing)
        if (data.images !== undefined) {
            updateData.images = {
                deleteMany: {}, // Delete existing images
                create: data.images
            };
        }

        // Handle links update (replace existing)
        if (data.links) {
            updateData.links = {
                deleteMany: {}, // Delete existing links
                create: data.links.map((url) => ({ url }))
            };
        }

        try {
            return await prisma.post.update({
                where: { id: postId, author_id: authorId } as any,
                data: updateData
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }
}

