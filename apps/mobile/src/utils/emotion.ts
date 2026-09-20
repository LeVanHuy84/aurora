import { TFunction } from 'i18next';

/**
 * Lấy nhãn cảm xúc đa ngôn ngữ theo `code` (ví dụ HAPPY -> Vui vẻ / Happy)
 * Fallback về label gốc hoặc code nếu không tìm thấy key dịch
 */
export function getEmotionLabel(
  emotion: { code?: string; label?: string } | null | undefined,
  t: TFunction,
): string {
  if (!emotion) return '';
  if (emotion.code) {
    return t(`emotions.${emotion.code}`, {
      defaultValue: emotion.label || emotion.code,
    });
  }
  return emotion.label || '';
}
