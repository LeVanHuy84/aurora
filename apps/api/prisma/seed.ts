import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRESET_EMOTIONS = [
  { code: 'HAPPY', label: 'Vui vẻ', icon: '😊', color: '#F4A261', order: 1 },
  { code: 'CALM', label: 'Bình yên', icon: '😌', color: '#7B9E89', order: 2 },
  { code: 'EXCITED', label: 'Hào hứng', icon: '🤩', color: '#E9C46A', order: 3 },
  { code: 'LOVED', label: 'Yêu thương', icon: '🥰', color: '#E76F51', order: 4 },
  { code: 'TIRED', label: 'Mệt mỏi', icon: '😴', color: '#8E7DBE', order: 5 },
  { code: 'SAD', label: 'Buồn bã', icon: '😔', color: '#5C80BC', order: 6 },
  { code: 'STRESSED', label: 'Căng thẳng', icon: '😤', color: '#E63946', order: 7 },
  { code: 'GRATEFUL', label: 'Biết ơn', icon: '🙏', color: '#2A9D8F', order: 8 },
];

async function main() {
  console.log('🌱 Seeding master data (Emotions)...');

  for (const emotion of PRESET_EMOTIONS) {
    await prisma.emotion.upsert({
      where: { code: emotion.code },
      update: {
        label: emotion.label,
        icon: emotion.icon,
        color: emotion.color,
        order: emotion.order,
        isActive: true,
      },
      create: {
        code: emotion.code,
        label: emotion.label,
        icon: emotion.icon,
        color: emotion.color,
        order: emotion.order,
        isActive: true,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
