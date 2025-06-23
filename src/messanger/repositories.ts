import { Prisma } from "../generated/prisma";
import { prisma } from "../prisma";
import { ChatGroupWithLastMessageAndOptionalMembers } from "./types";

export class ChatsRepository {
  async getAllByMemberWithLastSentMsg({
    profileId,
    includeMembers,
    personalOnly,
  }: {
    profileId: number;
    includeMembers?: boolean;
    personalOnly?: boolean;
  }): Promise<ChatGroupWithLastMessageAndOptionalMembers[]> {
    const options: Prisma.ChatGroupFindManyArgs = {
      include: {
        messages: {
          orderBy: { sent_at: "desc" },
          take: 1,
          include: { author: { include: { user: true } } },
        },
      },
      where: { members: { some: { profile_id: profileId } } },
    };
    if (includeMembers) {
      options.include!.members = {
        include: { profile: { include: { avatars: true, user: true } } },
      };
    }
    if (personalOnly) {
      options.where!.is_personal_chat = true;
    }
    return (await prisma.chatGroup.findMany(
      options,
    )) as ChatGroupWithLastMessageAndOptionalMembers[];
  }
}
