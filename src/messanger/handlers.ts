import { Request, Response } from "express";
import { requireAuthorized } from "../users/utils";
import { getSuccededResponse } from "../core/utils";
import { MessagerService, messangerService } from "./services";

export class MessangerHandlers {
  public service: MessagerService;
  constructor() {
    this.service = messangerService;
  }
  public listUserChats = async (req: Request, res: Response) => {
    const userId = requireAuthorized(res)
    const chats = await this.service.listUserChats(userId);
    res.status(200).json(getSuccededResponse(chats));
  };
}
