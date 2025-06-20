import { Post } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { Prisma } from "../generated/prisma";

export class PostsRepository {
  async getAll() {
    return await prisma.post.findMany({
      include: {
        tags: true,
        author: { include: { profile: { include: { avatars: true } } } },
        images: true,
        _count: { select: { likes: true, views: true } },
      },
    });
  }

  async deletePostForUserById(authorId: number, postId: number): Promise<void> {
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
    return await prisma.tag.findMany({})
  }
}
