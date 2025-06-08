import { User } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { Prisma } from "../generated/prisma";

export class UsersRepository {
  async findUnique(
    where: Prisma.UserWhereUniqueInput,
    options: Prisma.UserDefaultArgs = {},
  ) {
    try {
      return await prisma.user.findUniqueOrThrow({ where, ...options });
    } catch (err) {
      if (getErrorCode(err) === ErrorCodes.NotFound) {
        throw new NotFoundError();
      }
      throw err;
    }
  }
  async findByEmail(email: string): Promise<User> {
    return await this.findUnique({ email });
  }

  async getByIdWithRelations(
    id: number,
  ): Promise<User<{ include: { createdPosts: true } }>> {
    try {
      return await prisma.user.findUniqueOrThrow({
        where: { id },
        include: {
          createdPosts: {
            include: {
              tags: true,
              media: true,
              _count: { select: { likedBy: true, viewedBy: true } },
            },
          },
          albums: { include: { photos: true } }
        },
      });
    } catch (err) {
      if (getErrorCode(err) === ErrorCodes.NotFound) {
        throw new NotFoundError();
      }
      throw err;
    }
  }
  async getFriendsForUser(userId: number) {
    // get all friendship relations initiated by `userId` itself or to him from other user
    return await prisma.user.findMany({
      where: {
        OR: [
          {
            ownFriendships: { some: { fromUserId: userId, isApproved: true } },
          },
          { ownFriendships: { some: { toUserId: userId, isApproved: true } } },
        ],
        NOT: {
          id: userId,
        },
      },
    });
  }
  async getFriendRequestsForUser(userId: number) {
    // get all friend requests initiated to `userId` together with user which initiated it
    return await prisma.userFriend.findMany({
      where: { toUserId: userId, isApproved: false },
      include: { fromUser: true },
    });
  }

  async updateById(userId: number, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await prisma.user.update({ where: { id: userId }, data })
    } catch (err) {
      if (getErrorCode(err) === ErrorCodes.NotFound) {
        throw new NotFoundError();
      }
      throw err;
    }
  }

  async list(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (err) {
      if (getErrorCode(err) === ErrorCodes.AlreadyExists) {
        throw new AlreadyExistsError();
      }
      throw err;
    }
  }
}

export class OtpEmailRepository {
  async create(data: Prisma.OtpEmailCreateInput) {
    await prisma.otpEmail.create({ data });
  }
  async findByCodeAndEmail(code: string, email: string) {
    try {
      return await prisma.otpEmail.findUniqueOrThrow({
        where: { otp: code, email },
      });
    } catch (err) {
      if (getErrorCode(err) === ErrorCodes.NotFound) {
        throw new NotFoundError();
      }
      throw err;
    }
  }

  async deleteAllForEmail(email: string) {
    await prisma.otpEmail.deleteMany({ where: { email } });
  }
}
