import { ChatsRepository } from "./repositories";

export class MessagerService {
  private chatsRepo: ChatsRepository;

  constructor() {
    this.chatsRepo = new ChatsRepository();
  }

  async listGroupChats(currUserId: number) {
    const chats = await this.chatsRepo.getAllByMemberWithLastSentMsg({
      profileId: currUserId,
    });
    return chats.map((chat) => ({
      ...chat,
      messages: undefined,
      lastMessage: {
        ...chat.messages[0],
        author: chat.messages[0].author.user,
      },
    }));
  }

  async listPersonalChats(currUserId: number) {
    const chats = await this.chatsRepo.getAllByMemberWithLastSentMsg({
      profileId: currUserId,
      includeMembers: true,
      personalOnly: true,
    });
    return chats.map((chat) => {
      const withUser = chat.members.find(member => (member as any).profile.user.id !== currUserId) as any
      return {
        ...chat,
        messages: undefined,
        members: undefined,
        withUser: { ...withUser.profile.user, profile: { ...withUser.profile, user: undefined } },
        lastMessage: {
          ...chat.messages[0],
          author: chat.messages[0].author.user,
        },
      }
    });
  }
}

export const messangerService = new MessagerService();
