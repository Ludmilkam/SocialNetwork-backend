import { hash } from "bcryptjs";
import { PrismaClient, MediaType } from "./generated/prisma";
import { faker } from "@faker-js/faker";
import { execSync } from "child_process";

const prisma = new PrismaClient();

function cleanup() {
  const dbFilename = "db.sqlite";
  let delCmd = "rm";
  if (process.platform === "win32") {
    delCmd = "del";
  }
  try {
    console.log("deleting old database");
    execSync(delCmd + " " + dbFilename);
  } catch (err) {
    console.log("database does not exist, skipping");
  }
  console.log("Running migrations");
  execSync("npx prisma migrate dev");
  console.log("Cleanup complete");
}

async function main() {
  cleanup();
  // Создание тегов
  const tagNames = ["tech", "life", "news", "sports", "funny"];
  console.log("Creating tags");
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.create({
        data: { name },
      }),
    ),
  );
  const fakeSigUrl =
    "https://i.postimg.cc/Y9hXr68H/2e45ce67c76ede75ba73053a7a6cb14863dc3380.png";

  console.log("Creating users");
  const users = await Promise.all(
    Array.from({ length: 30 }).map(async () =>
      prisma.user.create({
        data: {
          username: faker.internet.username(),
          email: faker.internet.email(),
          signatureUrl: Math.random() < 0.5 ? fakeSigUrl : undefined,
          aboutMe: faker.lorem.sentence(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          birthDate: faker.date.birthdate(),
          avatarUrl: faker.image.avatar(),
          password: await hash("123456789", 10),
        },
      }),
    ),
  );
  let _usedUserIds: number[][] = [];
  const getUniqueFromUserToUserPairIds = (currUserId: number): number => {
    console.log("Count records", _usedUserIds.length)
    let userId = faker.helpers.arrayElement(users).id;
    const pairIds = [currUserId, userId];
    console.log(pairIds)
    while (
      currUserId === userId ||
      _usedUserIds.some(
        (el) =>
          (el[0] == currUserId && el[1] == userId) ||
          (el[1] == currUserId && el[0] == userId),
      )
    ) {
      userId = faker.helpers.arrayElement(users).id;
    }
    _usedUserIds.push(pairIds);
    return userId;
  };

  console.log("Creating friends for users");
  await Promise.all(
    users.map((user) =>
      prisma.userFriend.createMany({
        data: Array.from({ length: users.length % 10 }).map(() => ({
          fromUserId: user.id,
          toUserId: getUniqueFromUserToUserPairIds(user.id),
          isApproved: faker.datatype.boolean(),
        })),
      }),
    ),
  );

  console.log("Creating media");
  const mediaItems = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.media.create({
        data: {
          url: faker.image.url(),
          type: faker.helpers.arrayElement([MediaType.IMAGE, MediaType.VIDEO]),
        },
      }),
    ),
  );

  console.log("Creating user's albums");
  await Promise.all(
    users.map(async (user) =>
      prisma.album.createMany({
        data: Array.from({ length: faker.number.int({ max: 5 }) }).map(() => ({
          userId: user.id,
          name: faker.lorem.sentence(),
          subject: faker.lorem.words(3),
          year: faker.date.birthdate().getFullYear(),
        })),
      }),
    ),
  );

  console.log("Creating posts");
  for (let i = 0; i < 20; i++) {
    const author = faker.helpers.arrayElement(users);
    const postTags = faker.helpers.arrayElements(
      tags,
      faker.number.int({ min: 1, max: 3 }),
    );
    const postMedia = faker.helpers.arrayElements(
      mediaItems,
      faker.number.int({ min: 0, max: 2 }),
    );
    const likedBy = faker.helpers.arrayElements(
      users,
      faker.number.int({ min: 0, max: 5 }),
    );
    const viewedBy = faker.helpers.arrayElements(
      users,
      faker.number.int({ min: 0, max: 8 }),
    );

    await prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        subject: faker.lorem.words(3),
        body: faker.lorem.paragraphs(2),
        link: faker.internet.url(),
        author: { connect: { id: author.id } },
        tags: {
          connect: postTags.map((tag) => ({ id: tag.id })),
        },
        media: {
          connect: postMedia.map((media) => ({ id: media.id })),
        },
        likedBy: {
          connect: likedBy.map((user) => ({ id: user.id })),
        },
        viewedBy: {
          connect: viewedBy.map((user) => ({ id: user.id })),
        },
      },
    });
  }
}

main()
  .then(() => {
    console.log("Seeding complete!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
