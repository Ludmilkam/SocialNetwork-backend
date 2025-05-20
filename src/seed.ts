import { hash } from 'bcryptjs';
import { PrismaClient, MediaType } from './generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Создание тегов
  const tagNames = ['tech', 'life', 'news', 'sports', 'funny'];
  const tags = await Promise.all(
    tagNames.map(name =>
      prisma.tag.create({
        data: { name },
      })
    )
  );
  const fakeSigUrl = "https://i.postimg.cc/Y9hXr68H/2e45ce67c76ede75ba73053a7a6cb14863dc3380.png"

  // Создание пользователей
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () =>
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
          password: await hash("123456789", 10)
        },
      })
    )
  );

  // Создание медиа
  const mediaItems = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.media.create({
        data: {
          url: faker.image.url(),
          type: faker.helpers.arrayElement([MediaType.IMAGE, MediaType.VIDEO]),
        },
      })
    )
  );

  // Создание постов
  for (let i = 0; i < 20; i++) {
    const author = faker.helpers.arrayElement(users);
    const postTags = faker.helpers.arrayElements(tags, faker.number.int({ min: 1, max: 3 }));
    const postMedia = faker.helpers.arrayElements(mediaItems, faker.number.int({ min: 0, max: 2 }));
    const likedBy = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 5 }));
    const viewedBy = faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 8 }));

    await prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        subject: faker.lorem.words(3),
        body: faker.lorem.paragraphs(2),
        link: faker.internet.url(),
        author: { connect: { id: author.id } },
        tags: {
          connect: postTags.map(tag => ({ id: tag.id })),
        },
        media: {
          connect: postMedia.map(media => ({ id: media.id })),
        },
        likedBy: {
          connect: likedBy.map(user => ({ id: user.id })),
        },
        viewedBy: {
          connect: viewedBy.map(user => ({ id: user.id })),
        },
      },
    });
  }
}

main()
  .then(() => {
    console.log('Seeding complete!');
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

