import { CreatePostInput, UpdatePostInput, CreateTagInput } from "./types";
import { PostsRepository } from "./repositories";
import { NotFoundError } from "../core/repository";

export class PostNotFoundError extends Error {
  constructor(msg?: string) {
    super(msg || "Post not found");
  }
}

export class PostsService {
  private postsRepo: PostsRepository;

  constructor() {
    this.postsRepo = new PostsRepository();
  }

  async createPost(userId: number, data: CreatePostInput) {
    try {
      const newPost = await this.postsRepo.create({
        ...data,
        author: { connect: { id: userId } },
        images: { create: data.images },
        links: data.links
          ? { create: data.links.map((url) => ({ url })) }
          : undefined,
      });
      return { ...newPost };
    } catch (err) {
      throw err;
    }
  }
  async updatePost(userId: number, postId: number, data: UpdatePostInput) {
    try {
      return await this.postsRepo.updateByIdAndAuthor(postId, userId, data);
    }
    catch (err) {
      if (err instanceof NotFoundError) {
        throw new PostNotFoundError("Post does not exist or does not belongs to you")
      }
      throw err
    }
  }
  async deletePostForUser(userId: number, postId: number): Promise<void> {
    try {
      await this.postsRepo.deletePostForUserById(userId, postId);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new PostNotFoundError();
      }
      throw err;
    }
  }
  async listPosts(currUserId: number) {
    const posts = await this.postsRepo.getAll(currUserId);
    return posts.map(post => ({ ...post, tags: post.tags.map(tag => tag.tag) }))
  }
  async listTags() {
    return await this.postsRepo.getAllTags();
  }

  async createTag(data: CreateTagInput) {
    try {
      const newTag = await this.postsRepo.createTag({
        ...data,

      });
      return { ...newTag };
    } catch (err) {
      throw err;
    }

  }
}

export const postsService = new PostsService();
