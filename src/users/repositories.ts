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
    ): Promise<User<{ include: { profile: {} } }>> {
        try {
            return await prisma.user.findUniqueOrThrow({
                where: { id },
                include: {
                    profile: {
                        include: {
                            posts: {
                                include: {
                                    tags: true,
                                    images: true,
                                    _count: {
                                        select: { likes: true, views: true },
                                    },
                                }
                            },
                            albums: { include: { images: true } },
                            avatars: true
                        },
                    },
                },
            })
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
                        profile: {
                            friendship_sent_request: {
                                some: { profile1_id: userId, accepted: true },
                            },
                        }
                    },
                    {
                        profile: {
                            friendship_sent_request: {
                                some: { profile2_id: userId, accepted: true },
                            },
                        }
                    },
                ],
                NOT: {
                    id: userId,
                },
            },
            include: { profile: { include: { avatars: true } } }
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

                profile: {
                    OR: [
                        {
                            friendship_sent_request: {
                                some: { profile2_id: userId, accepted: false },
                            },
                        },
                        {
                            friendship_accepted_request: {
                                some: { profile1_id: userId, accepted: false },
                            },
                        }
                    ]
                }
                ,
                NOT: {
                    id: userId,
                },
            },
            include: { profile: { include: { avatars: true } } }
        });
    }
    async getAllWithoutFriendshipWith(userId: number) {
        return await prisma.user.findMany({
            where: { profile: { friendship_sent_request: { none: { profile2_id: userId } }, friendship_accepted_request: { none: { profile1_id: userId } } } },
            include: { profile: { include: { avatars: true } } }
        })
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
        return await prisma.user.findMany({
            include: { profile: { include: { avatars: true } } }
        });
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


    // TODO: handle not found errors
    async acceptRequest(fromUserId: number, toUserId: number) {
        console.log(fromUserId, toUserId);
        return prisma.friendship.update({
            where: { profile1_id_profile2_id: { profile1_id: fromUserId, profile2_id: toUserId } },
            data: { accepted: true },
        });
    }

    async deleteRequest(fromUserId: number, toUserId: number) {
        try {
            return await prisma.friendship.delete({
                where: { profile1_id_profile2_id: { profile1_id: fromUserId, profile2_id: toUserId } },
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    async deleteFriend(fromUserId: number, toUserId: number) {
        try {
            return await prisma.friendship.delete({
                where: { profile1_id_profile2_id: { profile1_id: fromUserId, profile2_id: toUserId } },
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    async createFriendRequest(fromUserId: number, toUserId: number) {
        return prisma.friendship.create({
            data: { profile1_id: fromUserId, profile2_id: toUserId },
        });
    }

    async deletePost(userId: number, postId: number): Promise<void> {
        try {
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: { author_id: true },
            });

            if (!post) {
                throw new Error("Post wasn`t found");
            }

            if (post.author_id !== userId) {
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
    async create(data: Prisma.VerificationCodeCreateInput) {
        await prisma.verificationCode.create({ data });
    }
    async findByCodeAndEmail(code: string, email: string) {
        try {
            return await prisma.verificationCode.findFirstOrThrow({
                where: { code, username: email },
            });
        } catch (err) {
            if (getErrorCode(err) === ErrorCodes.NotFound) {
                throw new NotFoundError();
            }
            throw err;
        }
    }

    async deleteAllForEmail(email: string) {
        await prisma.verificationCode.deleteMany({ where: { username: email } });
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
