import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRESET_EMOTIONS = [
  // Nhóm Tích cực & Năng lượng cao (Positive & Uplifting)
  { code: 'HAPPY', label: 'Vui vẻ', icon: '😊', color: '#F4A261', order: 1 },
  { code: 'EXCITED', label: 'Hào hứng', icon: '🤩', color: '#E9C46A', order: 2 },
  { code: 'LOVED', label: 'Được yêu thương', icon: '🥰', color: '#E76F51', order: 3 },
  { code: 'GRATEFUL', label: 'Biết ơn', icon: '🙏', color: '#2A9D8F', order: 4 },
  { code: 'PROUD', label: 'Tự hào', icon: '🌟', color: '#F77F00', order: 5 },

  // Nhóm Bình yên & Thư thái (Calm & Mindful)
  { code: 'CALM', label: 'Bình yên', icon: '😌', color: '#7B9E89', order: 6 },
  { code: 'PEACEFUL', label: 'Thanh thản', icon: '🌿', color: '#52B788', order: 7 },

  // Nhóm Trầm tư & Bối rối (Pensive & Low energy)
  { code: 'TIRED', label: 'Mệt mỏi', icon: '😴', color: '#8E7DBE', order: 8 },
  { code: 'BORED', label: 'Nhàm chán', icon: '🥱', color: '#9E9E9E', order: 9 },
  { code: 'CONFUSED', label: 'Bối rối', icon: '🤔', color: '#6A8CAF', order: 10 },

  // Nhóm Căng thẳng & Cần sẻ chia (Challenging & Needs care)
  { code: 'ANXIOUS', label: 'Lo âu', icon: '😰', color: '#9B5DE5', order: 11 },
  { code: 'SAD', label: 'Buồn bã', icon: '😔', color: '#5C80BC', order: 12 },
  { code: 'STRESSED', label: 'Căng thẳng', icon: '😤', color: '#E63946', order: 13 },
  { code: 'ANGRY', label: 'Tức giận', icon: '😡', color: '#D90429', order: 14 },
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
