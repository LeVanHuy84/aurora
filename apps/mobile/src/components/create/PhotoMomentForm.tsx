import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Button } from '../ui/Button';
import { Title, Caption, Body } from '../ui/Typography';
import { EmotionSelector } from '../moments/EmotionSelector';
import { EmotionItem } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface PhotoMomentFormProps {
  selectedImage: string | null;
  content: string;
  selectedEmotion?: EmotionItem | null;
  onChangeContent: (text: string) => void;
  onRemoveImage: () => void;
  onCaptureCamera: () => void;
  onPickFromGallery: () => void;
  onSelectEmotion?: (emotion: EmotionItem | null) => void;
}

export function PhotoMomentForm({
  selectedImage,
  content,
  selectedEmotion,
  onChangeContent,
  onRemoveImage,
  onCaptureCamera,
  onPickFromGallery,
  onSelectEmotion,
}: PhotoMomentFormProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <View
          style={[
            styles.imagePreviewContainer,
            { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
          ]}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.previewImage}
            contentFit="cover"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRemoveImage}
            style={styles.removeImageBtn}
          >
            <Ionicons name="trash-outline" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.photoPickerCard,
            {
              backgroundColor: isDark ? '#22201D' : '#F7F4EE',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.uploadIconCircle,
              { backgroundColor: isDark ? '#2E2B27' : '#EFEAE0' },
            ]}
          >
            <Ionicons name="camera-outline" size={32} color={colors.accentDark} />
          </View>
          <Title level={3} style={styles.uploadPromptTitle}>
            {t('moments.addPhotoPrompt', 'Thêm ảnh khoảnh khắc')}
          </Title>
          <Caption color="secondary" style={styles.uploadPromptSub}>
            {t('moments.addPhotoDesc', 'Chụp ảnh trực tiếp hoặc chọn từ thư viện')}
          </Caption>

          <View style={styles.uploadActionRow}>
            <Button
              title={t('moments.takePhoto', 'Chụp ảnh')}
              size="md"
              variant="primary"
              leftIcon={<Ionicons name="camera" size={16} color="#FFFFFF" />}
              onPress={onCaptureCamera}
              style={styles.pickerBtn}
            />
            <Button
              title={t('moments.pickFromGallery', 'Thư viện')}
              size="md"
              variant="secondary"
              leftIcon={<Ionicons name="images-outline" size={16} color={colors.textPrimary} />}
              onPress={onPickFromGallery}
              style={styles.pickerBtn}
            />
          </View>
        </View>
      )}

      {/* Caption Input */}
      <View
        style={[
          styles.captionCard,
          {
            backgroundColor: colors.surfaceSoft,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <TextInput
          multiline
          numberOfLines={3}
          value={content}
          onChangeText={(text) => {
            if (text.length <= 500) onChangeContent(text);
          }}
          placeholder={t('moments.captionPlaceholder', 'Viết đôi dòng cảm nghĩ về khoảnh khắc này...')}
          placeholderTextColor={colors.textMuted}
          style={[styles.captionInput, { color: colors.textPrimary }]}
        />
        <Caption color="muted" align="right" style={styles.charCounter}>
          {content.length}/500
        </Caption>
      </View>

      {/* Optional Emotion Attachment */}
      {onSelectEmotion ? (
        <View style={styles.emotionSection}>
          <View style={styles.emotionSectionHeader}>
            <Ionicons name="sparkles-outline" size={15} color={colors.accentDark} />
            <Body weight="semibold" color="secondary" style={styles.emotionSectionTitle}>
              {t('moments.attachEmotion', 'Cảm xúc đi kèm (Tùy chọn)')}
            </Body>
          </View>
          <EmotionSelector
            selectedId={selectedEmotion?.id}
            selectedCode={selectedEmotion?.code}
            onSelectEmotion={onSelectEmotion}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  photoPickerCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  uploadPromptTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  uploadPromptSub: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontSize: 13,
  },
  uploadActionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  pickerBtn: {
    flex: 1,
    minHeight: 42,
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionCard: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  captionInput: {
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 50,
  },
  charCounter: {
    fontSize: 11.5,
  },
  emotionSection: {
    marginTop: Spacing.md,
  },
  emotionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs + 2,
    paddingHorizontal: 2,
  },
  emotionSectionTitle: {
    fontSize: 13.5,
  },
});
