import { prisma } from "../prisma";

export class ChatsRepository {
  async getAllByMemberWithLastSentMsg(profileId: number) {
    return await prisma.chatGroup.findMany({
      include: { messages: { orderBy: { sent_at: "desc" }, take: 1, include: { author: { include: { user: true } } } } },
      where: { members: { some: { profile_id: profileId } } }
    })
  }
}
