import { createPostInput } from "./types";
import { PostsRepository } from "./repositories";

export class PostsService {
    private postsRepo: PostsRepository;

    constructor() {
        this.postsRepo = new PostsRepository();
    }

    async createPost(userId: number, data: createPostInput) {
        try {
            const newPost = await this.postsRepo.create({
                ...data,
                author: { connect: { id: userId } },
            });
            return { ...newPost };
        } catch (err) {
            throw err;
        }
    }

    async listPosts() {
        const posts = await this.postsRepo.getAll();
        return posts.map((post) => ({ ...post, author: { ...post.author, password: undefined } }));
    }
}

export const postsService = new PostsService();
