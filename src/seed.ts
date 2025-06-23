import { hash } from "bcryptjs";
import { PrismaClient } from "./generated/prisma";
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

  console.log("Creating users with profiles");
  const users = await Promise.all(
    Array.from({ length: 15 }).map(async () =>
      prisma.user.create({
        data: {
          username: faker.internet.username(),
          email: faker.internet.email(),
          profile: {
            create: {
              signature: Math.random() < 0.5 ? fakeSigUrl : undefined,
              date_of_birth: faker.date.birthdate(),
              avatars: { create: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(_ => ({ image: faker.image.avatar() })) }
            }
          },
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          password: await hash("123456789", 10),
        },
      }),
    ),
  );
const _usedUserIds: number[][] = [];

const getUniqueFromUserToUserPairIds = (currUserId: number): number => {
  let userId = faker.helpers.arrayElement(users).id;
  while (
    currUserId === userId ||
    _usedUserIds.some(
      ([a, b]) =>
        (a === currUserId && b === userId) ||
        (b === currUserId && a === userId)
    )
  ) {
    userId = faker.helpers.arrayElement(users).id;
  }
  _usedUserIds.push([currUserId, userId]);
  return userId;
};

  console.log("Creating friends for first x users")
  await Promise.all(users.slice(0, users.length / 2).map((user) =>
    prisma.friendship.createMany(
      {
        data: Array.from({ length: faker.number.int(5) })
          .map(() => ({ profile1_id: user.id, profile2_id: getUniqueFromUserToUserPairIds(user.id), accepted: faker.datatype.boolean() }))
      }
    )
  ))
console.log("Creating friends for first x users");

for (const user of users.slice(0, 5)) {
  const friendsData = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() => ({
    fromUserId: user.id,
    toUserId: getUniqueFromUserToUserPairIds(user.id),
    isApproved: faker.datatype.boolean(),
  }));

  await prisma.userFriend.createMany({
    data: friendsData
  });
}

  const generateImageObj = () => {
    const url = faker.image.url()
    const lastPartIdx = url.lastIndexOf("/")
    const filename = url.slice(lastPartIdx + 1)
    const file = url.slice(0, lastPartIdx)
    return { file, filename }
  }
  console.log("Creating media");
  const mediaItems = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.image.create({
        data: generateImageObj(),
      }),
    ),
  );

  console.log("Creating user's albums");
  await Promise.all(
    users.map(async (user) =>
      await Promise.all(
        Array.from({ length: faker.number.int({ max: 5 }) }).map(() => (prisma.album.create({
          data: {
            profile_id: user.id,
            name: faker.lorem.sentence(),
            shown: faker.datatype.boolean(),
            topic_id: faker.helpers.arrayElement(tags).id,
            images: {
              create: faker.helpers.arrayElements(
                mediaItems,
                faker.number.int({ min: 0, max: 3 })
              ).map(item => ({ image_id: item.id })),
            },
          }
        })),
        ),
      )
    )
  )

  console.log("Creating posts")
  for (let i = 0; i < 20; i++) {
    const author = faker.helpers.arrayElement(users);
    const postTags = faker.helpers.arrayElements(
      tags,
      faker.number.int({ min: 1, max: 3 }),
    );
    const postImages = faker.helpers.arrayElements(
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
        content: faker.lorem.paragraphs(2),
        links: { create: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(_ => ({ url: faker.internet.url() })) },
        author: { connect: { id: author.id } },
        tags: {
          create: postTags.map((tag) => ({ tag_id: tag.id })),
        },
        images: {
          connect: postImages.map((media) => ({ id: media.id })),
        },
        likes: {
          create: likedBy.map((user) => ({ profile_id: user.id })),
        },
        views: {
          create: viewedBy.map((user) => ({ profile_id: user.id })),
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
