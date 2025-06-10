import { createAlbumInput, User } from "./types";
import { prisma, getErrorCode, ErrorCodes } from "../prisma";
import { AlreadyExistsError, NotFoundError } from "../core/repository";
import { Album, Prisma } from "../generated/prisma";

export class UsersRepository {
    async findUnique(
        where: Prisma.UserWhereUniqueInput,
        options: Prisma.UserDefaultArgs = {}
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
        id: number
    ): Promise<User<{ include: { createdPosts: true } }>> {
        try {
            return await prisma.user.findUniqueOrThrow({
                where: { id },
                include: {
                    createdPosts: {
                        include: {
                            tags: true,
                            media: true,
                            _count: {
                                select: { likedBy: true, viewedBy: true },
                            },
                        },
                    },
                    albums: { include: { photos: true } },
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
                        ownFriendships: {
                            some: { fromUserId: userId, isApproved: true },
                        },
                    },
                    {
                        ownFriendships: {
                            some: { toUserId: userId, isApproved: true },
                        },
                    },
                ],
                NOT: {
                    id: userId,
                },
            },
        });
    }
    async getFriendRequestsForUser(userId: number) {
        // get all friend requests initiated to `userId` together with user which initiated it
        // return await prisma.userFriend.findMany({
        //   where: { toUserId: userId, isApproved: false },
        //   include: { fromUser: true },
        // });

        return await prisma.user.findMany({
            where: {
                OR: [
                    {
                        ownFriendships: {
                            some: { fromUserId: userId, isApproved: false },
                        },
                    },
                    {
                        ownFriendships: {
                            some: { toUserId: userId, isApproved: false },
                        },
                    },
                ],
                NOT: {
                    id: userId,
                },
            },
        });
    }

    async updateById(
        userId: number,
        data: Prisma.UserUpdateInput
    ): Promise<User> {
        try {
            return await prisma.user.update({ where: { id: userId }, data });
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

    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        try {
            return await prisma.user.update({
                where: { id },
                data,
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    async block(userId: number, blockedUserId: number): Promise<void> {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { blockedUsers: { connect: { id: blockedUserId } } },
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    // TODO: handle not found errors
    async acceptRequest(fromUserId: number, toUserId: number) {
        console.log(fromUserId, toUserId);
        return prisma.userFriend.update({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
            data: { isApproved: true },
        });
    }

    async declineRequest(fromUserId: number, toUserId: number) {
        return prisma.userFriend.delete({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
        });
    }

    async deleteFriend(fromUserId: number, toUserId: number) {
        return prisma.userFriend.delete({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
        });
    }

    async createFriendRequest(fromUserId: number, toUserId: number) {
        return prisma.userFriend.create({
            data: { fromUserId, toUserId, isApproved: false },
        });
    }

    async deletePost(userId: number, postId: number): Promise<void> {
        try {
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: { authorId: true },
            });

            if (!post) {
                throw new Error("Post wasn`t found");
            }

            if (post.authorId !== userId) {
                throw new Error("It`s not your post");
            }
            await prisma.post.delete({
                where: { id: postId },
            });

            return;
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
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

export class AlbumRepository {
    async findUnique(
        where: Prisma.AlbumWhereUniqueInput,
        options: Prisma.AlbumDefaultArgs = {}
    ): Promise<Album> {
        try {
            return await prisma.album.findUniqueOrThrow({ where, ...options });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    async createAlbum(data: Prisma.AlbumCreateArgs["data"]): Promise<Album> {
        return await prisma.album.create({
            data: data
        });
    }

    async deleteAlbum(albumId: number): Promise<void> {
        try {
            await prisma.album.delete({
                where: { id: albumId }
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    async updateAlbum(albumId: number, data: Prisma.AlbumUpdateArgs["data"]): Promise<Album> {
        try {
            return await prisma.album.update({
                where: { id: albumId },
                data: data
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }
}
