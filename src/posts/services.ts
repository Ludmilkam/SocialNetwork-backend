import { CreatePostInput } from "./types";
import { PostsRepository } from "./repositories";

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
                media: { create: data.media }
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
