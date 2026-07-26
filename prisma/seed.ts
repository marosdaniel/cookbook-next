import { METADATA_DEFINITIONS } from '../src/lib/metadata/definitions';

import { prisma } from '../src/lib/prisma/prisma';

async function main() {
  console.log('Start seeding metadata...');

  for (const item of METADATA_DEFINITIONS) {
    await prisma.metadata.upsert({
      where: {
        type_key: {
          type: item.type,
          key: item.key,
        },
      },
      update: {
        translationKey: item.translationKey,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      },
      create: {
        type: item.type,
        key: item.key,
        translationKey: item.translationKey,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
