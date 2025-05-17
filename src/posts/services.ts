import { PostsRepository } from "./repositories";

export class PostsService {
  private postsRepo: PostsRepository;

  constructor() {
    this.postsRepo = new PostsRepository();
  }
  public listPosts = async () => {
    return await this.postsRepo.getAll()
  }

}

export const postsService = new PostsService()
