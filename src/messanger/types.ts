import { Prisma } from "../generated/prisma";

export type ChatGroupWithLastMessageAndOptionalMembers =
  Prisma.ChatGroupGetPayload<{
    include: {
      messages: {
        include: {
          author: {
            include: {
              user: true;
            };
          };
        };
      };
      members?: {
        include: {
          profile: {
            include: {
              avatars: true;
              user: true;
            };
          };
        };
      };
    };
  }>;
