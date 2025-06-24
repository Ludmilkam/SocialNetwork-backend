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
  async getByIdWithMessagesAndMembers({
    chatId,
    profileId,
    messageLimit = 50,
    messageOffset = 0,
  }: {
    chatId: number;
    profileId: number;
    messageLimit?: number;
    messageOffset?: number;
  }) {
    // First check if user is a member of this chat
    const membership = await prisma.chatGroupMember.findFirst({
      where: {
        chatgroup_id: chatId,
        profile_id: profileId,
      },
    });

    if (!membership) {
      return null; // User is not a member of this chat
    }

    return await prisma.chatGroup.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { sent_at: 'desc' },
          take: messageLimit,
          skip: messageOffset,
        },
        members: {
          include: {
            profile: {
              include: {
                user: true,
                avatars: true,
              },
            },
          },
        },
        admin: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
