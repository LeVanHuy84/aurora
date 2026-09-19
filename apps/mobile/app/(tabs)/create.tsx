import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { useCreateMoment } from '../../src/hooks/use-moments';
import { mediaService } from '../../src/services/modules/media.service';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { EmotionSelector } from '../../src/components/moments/EmotionSelector';
import { Button } from '../../src/components/ui/Button';
import { Title, Body, Caption, Label } from '../../src/components/ui/Typography';
import { PresetEmotion } from '../../src/constants/emotions';
import { MomentType, Visibility } from '@aurora/types';
import { Spacing, BorderRadius } from '../../src/constants/theme';

export default function CreateMomentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const createMoment = useCreateMoment();

  // Form states
  const [momentType, setMomentType] = useState<MomentType>(MomentType.PHOTO);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<PresetEmotion | null>(null);
  const [visibility, setVisibility] = useState<Visibility>(Visibility.CLOSE_FRIENDS);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Image Pick from Gallery
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), t('moments.galleryPermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
        setErrorMessage('');
      }
    } catch (err: any) {
      console.warn('Gallery pick error', err);
    }
  };

  // Handle Camera Capture
  const handleCaptureCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), t('moments.cameraPermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
        setErrorMessage('');
      }
    } catch (err: any) {
      console.warn('Camera capture error', err);
    }
  };

  const handleClose = () => {
    router.replace('/(tabs)');
  };

  // Submit Handler
  const handleShareMoment = async () => {
    setErrorMessage('');

    // Validation
    if (momentType === MomentType.PHOTO && !selectedImage) {
      setErrorMessage(t('moments.errors.photoRequired'));
      return;
    }

    if (momentType === MomentType.NOTE && !content.trim()) {
      setErrorMessage(t('moments.errors.contentRequired'));
      return;
    }

    if (momentType === MomentType.MOOD && !selectedEmotion) {
      setErrorMessage(t('moments.errors.emotionRequired'));
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl: string | undefined = undefined;

      // 1. Upload Photo to Cloudinary if type is PHOTO
      if (momentType === MomentType.PHOTO && selectedImage) {
        finalImageUrl = await mediaService.uploadImage(selectedImage);
      }

      // 2. Call Create Moment API
      await createMoment.mutateAsync({
        type: momentType,
        content: content.trim() || undefined,
        imageUrl: finalImageUrl,
        emotionId: undefined, // Backend allows optional emotion or default
        visibility,
      });

      // Reset form & Navigate back to Today tab
      setIsUploading(false);
      setSelectedImage(null);
      setContent('');
      setSelectedEmotion(null);
      router.replace('/(tabs)');
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err?.message || t('moments.errors.createFailed'));
    }
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={styles.scrollContent}
      header={
        <View style={[styles.topNav, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            style={[
              styles.closeBtn,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Title level={3} style={styles.navTitle}>
            {t('moments.createMomentTitle')}
          </Title>

          <View style={styles.navPlaceholder} />
        </View>
      }
    >
      {/* 1. Moment Type Segmented Selector */}
      <View
        style={[
          styles.segmentContainer,
          { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMomentType(MomentType.PHOTO)}
          style={[
            styles.segmentBtn,
            momentType === MomentType.PHOTO && {
              backgroundColor: colors.card,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        >
          <Ionicons
            name="camera-outline"
            size={16}
            color={
              momentType === MomentType.PHOTO
                ? colors.accentDark
                : colors.textSecondary
            }
          />
          <Caption
            weight={momentType === MomentType.PHOTO ? 'bold' : 'medium'}
            color={
              momentType === MomentType.PHOTO
                ? colors.accentDark
                : 'secondary'
            }
          >
            {t('moments.photo')}
          </Caption>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMomentType(MomentType.NOTE)}
          style={[
            styles.segmentBtn,
            momentType === MomentType.NOTE && {
              backgroundColor: colors.card,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={
              momentType === MomentType.NOTE
                ? colors.accentDark
                : colors.textSecondary
            }
          />
          <Caption
            weight={momentType === MomentType.NOTE ? 'bold' : 'medium'}
            color={
              momentType === MomentType.NOTE
                ? colors.accentDark
                : 'secondary'
            }
          >
            {t('moments.note')}
          </Caption>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMomentType(MomentType.MOOD)}
          style={[
            styles.segmentBtn,
            momentType === MomentType.MOOD && {
              backgroundColor: colors.card,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        >
          <Ionicons
            name="happy-outline"
            size={16}
            color={
              momentType === MomentType.MOOD
                ? colors.accentDark
                : colors.textSecondary
            }
          />
          <Caption
            weight={momentType === MomentType.MOOD ? 'bold' : 'medium'}
            color={
              momentType === MomentType.MOOD
                ? colors.accentDark
                : 'secondary'
            }
          >
            {t('moments.mood')}
          </Caption>
        </TouchableOpacity>
      </View>

      {/* Error Message Banner */}
      {errorMessage ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: '#FDE8E8', borderColor: colors.danger },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Body color="danger" weight="medium" style={styles.errorText}>
            {errorMessage}
          </Body>
        </View>
      ) : null}

      {/* 2. TAB: PHOTO (Hero Photo Upload Box + Caption) */}
      {momentType === MomentType.PHOTO && (
        <>
          <View style={styles.section}>
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
                  activeOpacity={0.7}
                  onPress={() => setSelectedImage(null)}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.uploadBox,
                  {
                    backgroundColor: colors.surfaceSoft,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.uploadIconCircle,
                    { backgroundColor: isDark ? '#2C2926' : '#FDF4EB' },
                  ]}
                >
                  <Ionicons name="camera-outline" size={32} color={colors.accentDark} />
                </View>
                <Title level={3} style={styles.uploadPromptTitle}>
                  {t('moments.addPhotoPrompt')}
                </Title>
                <Caption color="secondary" style={styles.uploadPromptSub}>
                  {t('moments.addPhotoDesc')}
                </Caption>

                <View style={styles.uploadActionRow}>
                  <Button
                    title={t('moments.takePhoto')}
                    size="sm"
                    variant="secondary"
                    leftIcon={<Ionicons name="camera" size={16} color={colors.textPrimary} />}
                    onPress={handleCaptureCamera}
                    fullWidth={false}
                  />
                  <Button
                    title={t('moments.pickFromGallery')}
                    size="sm"
                    variant="primary"
                    leftIcon={<Ionicons name="images" size={16} color="#FFFFFF" />}
                    onPress={handlePickFromGallery}
                    fullWidth={false}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Caption */}
          <View style={styles.section}>
            <Label color="primary" style={styles.sectionLabel}>
              {t('moments.captionLabel')}
            </Label>
            <View
              style={[
                styles.textInputContainer,
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
                  if (text.length <= 500) setContent(text);
                }}
                placeholder={t('moments.captionPlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, { color: colors.textPrimary }]}
              />
              <Caption color="muted" align="right" style={styles.charCounter}>
                {content.length}/500
              </Caption>
            </View>
          </View>

          {/* Optional Mood Tag */}
          <View style={styles.section}>
            <Label color="primary" style={styles.sectionLabel}>
              {t('moments.howAreYouFeeling')}
            </Label>
            <EmotionSelector
              selectedCode={selectedEmotion?.code}
              onSelectEmotion={(emotion) => setSelectedEmotion(emotion)}
            />
          </View>
        </>
      )}

      {/* 3. TAB: NOTE (Hero Memo / Journal Card with large typography) */}
      {momentType === MomentType.NOTE && (
        <>
          <View style={styles.section}>
            <View
              style={[
                styles.memoCardContainer,
                {
                  backgroundColor: isDark ? '#262422' : '#FFFDF9',
                  borderColor: isDark ? '#3D3835' : '#E8DFD5',
                },
              ]}
            >
              <View style={styles.memoHeader}>
                <View style={styles.memoPin}>
                  <Ionicons name="document-text-outline" size={18} color={colors.accentDark} />
                  <Caption color="primary" weight="bold">
                    {t('moments.note')}
                  </Caption>
                </View>
                <Caption color="muted">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Caption>
              </View>

              <TextInput
                multiline
                numberOfLines={6}
                value={content}
                autoFocus
                onChangeText={(text) => {
                  if (text.length <= 500) setContent(text);
                }}
                placeholder={t('moments.notePlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.memoTextInput,
                  { color: colors.textPrimary },
                ]}
              />

              <View style={styles.memoFooter}>
                <Caption color="muted">{content.length}/500</Caption>
              </View>
            </View>
          </View>

          {/* Optional Emotion for Note */}
          <View style={styles.section}>
            <Label color="secondary" style={styles.sectionLabel}>
              {t('moments.howAreYouFeeling')} ({t('common.optional', 'Tùy chọn')})
            </Label>
            <EmotionSelector
              selectedCode={selectedEmotion?.code}
              onSelectEmotion={(emotion) => setSelectedEmotion(emotion)}
            />
          </View>
        </>
      )}

      {/* 4. TAB: MOOD (Hero Mood Check-in Widget + Optional Short Reflection) */}
      {momentType === MomentType.MOOD && (
        <>
          {/* Hero Selected Mood Display */}
          <View style={styles.section}>
            <View
              style={[
                styles.moodHeroBox,
                {
                  backgroundColor: selectedEmotion
                    ? isDark
                      ? '#2A2520'
                      : '#FFF7ED'
                    : colors.surfaceSoft,
                  borderColor: selectedEmotion
                    ? colors.accentDark
                    : colors.cardBorder,
                },
              ]}
            >
              <Title level={1} style={styles.moodHeroEmoji}>
                {selectedEmotion?.icon || '✨'}
              </Title>
              <Title level={2} style={[styles.moodHeroLabel, { color: colors.textPrimary }]}>
                {selectedEmotion ? t(selectedEmotion.labelKey) : t('moments.selectYourMoodPrompt', 'Chọn cảm xúc hôm nay')}
              </Title>
              <Caption color="secondary" align="center" style={styles.moodHeroSubtitle}>
                {selectedEmotion
                  ? t('moments.moodCheckInDesc', 'Khoảnh khắc cảm xúc này sẽ được ghi vào nhật ký và bản đồ cảm xúc tháng')
                  : t('moments.howAreYouFeeling')}
              </Caption>
            </View>
          </View>

          {/* Emotion Grid Selector */}
          <View style={styles.section}>
            <EmotionSelector
              selectedCode={selectedEmotion?.code}
              onSelectEmotion={(emotion) => setSelectedEmotion(emotion)}
            />
          </View>

          {/* Optional Reflection Note */}
          <View style={styles.section}>
            <Label color="secondary" style={styles.sectionLabel}>
              {t('moments.moodReasonLabel')} ({t('common.optional', 'Tùy chọn')})
            </Label>
            <View
              style={[
                styles.textInputContainer,
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
                  if (text.length <= 500) setContent(text);
                }}
                placeholder={t('moments.moodPlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, { color: colors.textPrimary }]}
              />
              <Caption color="muted" align="right" style={styles.charCounter}>
                {content.length}/500
              </Caption>
            </View>
          </View>
        </>
      )}

      {/* 5. Visibility Selector Section */}
      <View style={styles.section}>
        <Label color="primary" style={styles.sectionLabel}>
          {t('moments.visibility')}
        </Label>

        <View style={styles.visibilityRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setVisibility(Visibility.CLOSE_FRIENDS)}
            style={[
              styles.visibilityCard,
              {
                backgroundColor:
                  visibility === Visibility.CLOSE_FRIENDS
                    ? isDark
                      ? '#1C382F'
                      : '#E8F5E9'
                    : colors.surfaceSoft,
                borderColor:
                  visibility === Visibility.CLOSE_FRIENDS
                    ? colors.closeFriends
                    : colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="lock-closed"
              size={18}
              color={
                visibility === Visibility.CLOSE_FRIENDS
                  ? colors.closeFriends
                  : colors.textSecondary
              }
            />
            <Body
              weight={visibility === Visibility.CLOSE_FRIENDS ? 'bold' : 'medium'}
              style={{
                color:
                  visibility === Visibility.CLOSE_FRIENDS
                    ? colors.closeFriends
                    : colors.textPrimary,
              }}
            >
              {t('moments.closeFriends')}
            </Body>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setVisibility(Visibility.FRIENDS)}
            style={[
              styles.visibilityCard,
              {
                backgroundColor:
                  visibility === Visibility.FRIENDS
                    ? isDark
                      ? '#2C2926'
                      : '#FFF4EB'
                    : colors.surfaceSoft,
                borderColor:
                  visibility === Visibility.FRIENDS
                    ? colors.accentDark
                    : colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="people"
              size={18}
              color={
                visibility === Visibility.FRIENDS
                  ? colors.accentDark
                  : colors.textSecondary
              }
            />
            <Body
              weight={visibility === Visibility.FRIENDS ? 'bold' : 'medium'}
              style={{
                color:
                  visibility === Visibility.FRIENDS
                    ? colors.accentDark
                    : colors.textPrimary,
              }}
            >
              {t('moments.friends')}
            </Body>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setVisibility(Visibility.ONLY_ME)}
            style={[
              styles.visibilityCard,
              {
                backgroundColor:
                  visibility === Visibility.ONLY_ME
                    ? isDark
                      ? '#242220'
                      : '#F5F3EF'
                    : colors.surfaceSoft,
                borderColor:
                  visibility === Visibility.ONLY_ME
                    ? colors.textPrimary
                    : colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="person"
              size={18}
              color={
                visibility === Visibility.ONLY_ME
                  ? colors.textPrimary
                  : colors.textSecondary
              }
            />
            <Body
              weight={visibility === Visibility.ONLY_ME ? 'bold' : 'medium'}
              style={{
                color:
                  visibility === Visibility.ONLY_ME
                    ? colors.textPrimary
                    : colors.textSecondary,
              }}
            >
              {t('moments.onlyMe')}
            </Body>
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. Submit Action Button */}
      <View style={styles.footerAction}>
        <Button
          title={
            isUploading
              ? t('moments.sharingProgress')
              : t('moments.shareMomentBtn')
          }
          size="lg"
          variant="primary"
          loading={isUploading || createMoment.isPending}
          onPress={handleShareMoment}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    letterSpacing: -0.2,
  },
  navPlaceholder: {
    width: 36,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 4,
    marginVertical: Spacing.md,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs + 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.xs + 2,
  },
  uploadBox: {
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    marginBottom: 2,
  },
  uploadPromptSub: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  uploadActionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
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
  textInputContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  charCounter: {
    fontSize: 11,
  },
  memoCardContainer: {
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
    padding: Spacing.lg,
    minHeight: 180,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  memoPin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  memoTextInput: {
    fontSize: 17,
    lineHeight: 26,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  memoFooter: {
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  moodHeroBox: {
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodHeroEmoji: {
    fontSize: 52,
    lineHeight: 60,
    marginBottom: Spacing.xs,
  },
  moodHeroLabel: {
    fontSize: 20,
    marginBottom: 4,
    textAlign: 'center',
  },
  moodHeroSubtitle: {
    paddingHorizontal: Spacing.md,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  visibilityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.xs + 2,
  },
  footerAction: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
