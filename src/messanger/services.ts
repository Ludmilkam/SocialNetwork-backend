import { ChatsRepository } from "./repositories";

export class MessagerService {
  private chatsRepo: ChatsRepository;

  constructor() {
    this.chatsRepo = new ChatsRepository();
  }

  async listUserChats(currUserId: number) {
    const chats = await this.chatsRepo.getAllByMemberWithLastSentMsg(currUserId)
    return chats.map(chat => ({ ...chat, messages: undefined, lastMessage: { ...chat.messages[0], author: chat.messages[0].author.user } }))
  }

}

export const messangerService = new MessagerService()
