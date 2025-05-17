import { createPostInput } from "./types";
import { PostsRepository } from "./repositories";

export class PostsService {
    private postsRepo: PostsRepository;

    constructor() {
        this.postsRepo = new PostsRepository();
    }

    async createPost(postId: number, data: createPostInput) {
        try {
            const newPost = await this.postsRepo.create({
                ...data,
                user: { connect: { id: postId } },
            });
            return { ...newPost};
        } catch (err) {
            throw err;
        }
    }

    async listPosts() {
        const posts = await this.postsRepo.list();
        return posts.map((post) => ({ ...post, password: undefined }));
    }
}

export const postsService = new PostsService();