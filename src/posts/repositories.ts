import { prisma } from "../prisma";

export class PostsRepository {
  async getAll() {
    return await prisma.post.findMany({
      include: {
        tags: true, media: true, _count: { select: { likedBy: true, viewedBy: true } }
      }
    }
    )
  }
}
