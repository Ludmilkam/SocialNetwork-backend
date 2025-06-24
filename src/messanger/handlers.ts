import { Request, Response } from "express";
import { requireAuthorized } from "../users/utils";
import { getFailedResponse, getSuccededResponse } from "../core/utils";
import { MessagerService, messangerService } from "./services";

export class MessangerHandlers {
  public service: MessagerService;
  constructor() {
    this.service = messangerService;
  }
  public listGroupChats = async (req: Request, res: Response) => {
    const userId = requireAuthorized(res);
    const chats = await this.service.listGroupChats(userId);
    res.status(200).json(getSuccededResponse(chats));
  };
  public listPersonalChats = async (req: Request, res: Response) => {
    const userId = requireAuthorized(res);
    const chats = await this.service.listPersonalChats(userId);
    res.status(200).json(getSuccededResponse(chats));
  };
  public getChat = async (req: Request, res: Response) => {
    try {
      const userId = requireAuthorized(res);
      const chatId = parseInt(req.params.id);

      // Validate chatId
      if (isNaN(chatId)) {
        res.status(400).json(getFailedResponse('Invalid chat ID'));
        return
      }

      // Optional query parameters for pagination
      const messageLimit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messageOffset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

      const chat = await this.service.getChat(chatId, userId, messageLimit, messageOffset);

      if (!chat) {
        res.status(404).json(getFailedResponse('Chat not found or access denied'));
        return
      }

      res.status(200).json(getSuccededResponse(chat));
    } catch (error) {
      console.error('Error getting chat:', error);
      res.status(500).json(getFailedResponse('Internal server error'));
    }
  };
}
