import { createPostInput } from "./types";
import { PostsRepository } from "./repositories";
import { prisma } from "../prisma";

export class PostsService {
    private postsRepo: PostsRepository;

    constructor() {
        this.postsRepo = new PostsRepository();
    }

    async createPost(userId: number, data: createPostInput) {
        return await prisma.post.create({
            data: {
                title: data.title,
                subject: data.subject,
                body: data.body,
                link: data.link,
                author: {
                    connect: { id: userId },
                },
                tags: {
                    connectOrCreate: data.tags?.map((tagName) => ({
                        where: { name: tagName },  
                        create: { name: tagName }, 
                    })) || [],
                },
            },
        });
    }


    async listPosts() {
        const posts = await this.postsRepo.list();
        return posts.map((post) => ({ ...post }));
    }
}

export const postsService = new PostsService();
