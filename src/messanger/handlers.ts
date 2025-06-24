import { Request, Response } from "express";
import { requireAuthorized } from "../users/utils";
import { getSuccededResponse } from "../core/utils";
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
}
