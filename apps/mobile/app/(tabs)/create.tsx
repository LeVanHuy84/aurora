import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
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

  // Validation check for primary CTA
  const isSubmitDisabled =
    (momentType === MomentType.PHOTO && !selectedImage) ||
    (momentType === MomentType.NOTE && !content.trim()) ||
    (momentType === MomentType.MOOD && !selectedEmotion);

  // Submit Handler
  const handleShareMoment = async () => {
    setErrorMessage('');

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
        emotionId: undefined, // Backend associates emotion or allows custom
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
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.scrollContent}
      header={
        <View style={[styles.topNav, { borderBottomColor: colors.divider }]}>
          {/* Left: Close button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.navBtn,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="close" size={19} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Center: Title */}
          <Title level={3} style={styles.navTitle}>
            {t('moments.createMomentTitle')}
          </Title>

          {/* Right: Secondary Options/Settings button */}
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.navBtn,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
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
          onPress={() => {
            setMomentType(MomentType.PHOTO);
            setErrorMessage('');
          }}
          style={[
            styles.segmentBtn,
            momentType === MomentType.PHOTO && [
              styles.segmentBtnActive,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
              },
            ],
          ]}
        >
          <Ionicons
            name="camera-outline"
            size={15}
            color={
              momentType === MomentType.PHOTO
                ? colors.accentDark
                : colors.textSecondary
            }
          />
          <Caption
            weight={momentType === MomentType.PHOTO ? 'bold' : 'medium'}
            style={{
              color:
                momentType === MomentType.PHOTO
                  ? colors.accentDark
                  : colors.textSecondary,
              fontSize: 13,
            }}
          >
            {t('moments.photo')}
          </Caption>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setMomentType(MomentType.NOTE);
            setErrorMessage('');
          }}
          style={[
            styles.segmentBtn,
            momentType === MomentType.NOTE && [
              styles.segmentBtnActive,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
              },
            ],
          ]}
        >
          <Ionicons
            name="create-outline"
            size={15}
            color={
              momentType === MomentType.NOTE
                ? colors.accentDark
                : colors.textSecondary
            }
          />
          <Caption
            weight={momentType === MomentType.NOTE ? 'bold' : 'medium'}
            style={{
              color:
                momentType === MomentType.NOTE
                  ? colors.accentDark
                  : colors.textSecondary,
              fontSize: 13,
            }}
          >
            {t('moments.note')}
          </Caption>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setMomentType(MomentType.MOOD);
            setErrorMessage('');
          }}
          style={[
            styles.segmentBtn,
            momentType === MomentType.MOOD && [
              styles.segmentBtnActive,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
              },
            ],
          ]}
        >
          <Ionicons
            name="happy-outline"
            size={15}
            color={
              momentType === MomentType.MOOD
                ? colors.accentDark
                : colors.textSecondary
            }
          />
          <Caption
            weight={momentType === MomentType.MOOD ? 'bold' : 'medium'}
            style={{
              color:
                momentType === MomentType.MOOD
                  ? colors.accentDark
                  : colors.textSecondary,
              fontSize: 13,
            }}
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
            { backgroundColor: isDark ? '#2D1618' : '#FDE8E8', borderColor: colors.danger },
          ]}
        >
          <Ionicons name="alert-circle" size={17} color={colors.danger} />
          <Body color="danger" weight="medium" style={styles.errorText}>
            {errorMessage}
          </Body>
        </View>
      ) : null}

      {/* 2. TAB: PHOTO */}
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
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
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
                  <Ionicons name="camera-outline" size={26} color={colors.accentDark} />
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
                    variant="primary"
                    leftIcon={<Ionicons name="camera" size={15} color="#FFFFFF" />}
                    onPress={handleCaptureCamera}
                    fullWidth={false}
                    style={styles.heroActionBtn}
                  />
                  <Button
                    title={t('moments.pickFromGallery')}
                    size="sm"
                    variant="secondary"
                    leftIcon={<Ionicons name="images-outline" size={15} color={colors.textPrimary} />}
                    onPress={handlePickFromGallery}
                    fullWidth={false}
                    style={styles.heroActionBtn}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Caption Textarea */}
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

      {/* 3. TAB: NOTE */}
      {momentType === MomentType.NOTE && (
        <>
          <View style={styles.section}>
            <Label color="primary" style={styles.sectionLabel}>
              {t('moments.noteContentLabel')}
            </Label>
            <View
              style={[
                styles.memoCardContainer,
                {
                  backgroundColor: isDark ? '#242220' : '#FAF7F2',
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.memoHeader}>
                <View style={styles.memoPin}>
                  <Ionicons name="document-text-outline" size={15} color={colors.accentDark} />
                  <Caption color="primary" weight="bold">
                    {t('moments.note')}
                  </Caption>
                </View>
                <Caption color="muted">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Caption>
              </View>

              <TextInput
                multiline
                numberOfLines={5}
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
              {t('moments.howAreYouFeeling')}
            </Label>
            <EmotionSelector
              selectedCode={selectedEmotion?.code}
              onSelectEmotion={(emotion) => setSelectedEmotion(emotion)}
            />
          </View>
        </>
      )}

      {/* 4. TAB: MOOD */}
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
                      ? selectedEmotion.bgDark
                      : selectedEmotion.bgLight
                    : colors.surfaceSoft,
                  borderColor: selectedEmotion
                    ? selectedEmotion.color
                    : colors.cardBorder,
                },
              ]}
            >
              <Title level={1} style={styles.moodHeroEmoji}>
                {selectedEmotion?.icon || '✨'}
              </Title>
              <Title level={2} style={[styles.moodHeroLabel, { color: colors.textPrimary }]}>
                {selectedEmotion ? t(selectedEmotion.labelKey) : t('moments.howAreYouFeeling')}
              </Title>
              <Caption color="secondary" align="center" style={styles.moodHeroSubtitle}>
                {selectedEmotion
                  ? t('moments.moodCheckInDesc', 'Khoảnh khắc cảm xúc này sẽ được ghi vào nhật ký và bản đồ cảm xúc tháng')
                  : t('moments.selectYourMoodPrompt', 'Chọn một cảm xúc bên dưới để check-in hôm nay')}
              </Caption>
            </View>
          </View>

          {/* Emotion Grid / Scroll Selector */}
          <View style={styles.section}>
            <EmotionSelector
              selectedCode={selectedEmotion?.code}
              onSelectEmotion={(emotion) => setSelectedEmotion(emotion)}
            />
          </View>

          {/* Reflection Note */}
          <View style={styles.section}>
            <Label color="secondary" style={styles.sectionLabel}>
              {t('moments.moodReasonLabel')}
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
              size={15}
              color={
                visibility === Visibility.CLOSE_FRIENDS
                  ? colors.closeFriends
                  : colors.textSecondary
              }
            />
            <Caption
              weight={visibility === Visibility.CLOSE_FRIENDS ? 'bold' : 'medium'}
              style={{
                color:
                  visibility === Visibility.CLOSE_FRIENDS
                    ? colors.closeFriends
                    : colors.textPrimary,
                fontSize: 12,
              }}
            >
              {t('moments.closeFriends')}
            </Caption>
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
              size={15}
              color={
                visibility === Visibility.FRIENDS
                  ? colors.accentDark
                  : colors.textSecondary
              }
            />
            <Caption
              weight={visibility === Visibility.FRIENDS ? 'bold' : 'medium'}
              style={{
                color:
                  visibility === Visibility.FRIENDS
                    ? colors.accentDark
                    : colors.textPrimary,
                fontSize: 12,
              }}
            >
              {t('moments.friends')}
            </Caption>
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
              size={15}
              color={
                visibility === Visibility.ONLY_ME
                  ? colors.textPrimary
                  : colors.textSecondary
              }
            />
            <Caption
              weight={visibility === Visibility.ONLY_ME ? 'bold' : 'medium'}
              style={{
                color:
                  visibility === Visibility.ONLY_ME
                    ? colors.textPrimary
                    : colors.textSecondary,
                fontSize: 12,
              }}
            >
              {t('moments.onlyMe')}
            </Caption>
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
          disabled={isSubmitDisabled}
          loading={isUploading || createMoment.isPending}
          onPress={handleShareMoment}
          style={[styles.primaryCta, isSubmitDisabled && styles.primaryCtaDisabled]}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl * 2.5,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    letterSpacing: -0.2,
    fontWeight: '700',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    height: 42,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  segmentBtnActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 13,
  },
  uploadBox: {
    borderRadius: BorderRadius.card,
    borderWidth: 1.2,
    borderStyle: 'dashed',
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs + 2,
  },
  uploadPromptTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  uploadPromptSub: {
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontSize: 12,
  },
  uploadActionRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
    width: '100%',
    justifyContent: 'center',
  },
  heroActionBtn: {
    paddingHorizontal: Spacing.md,
    minHeight: 38,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    padding: Spacing.sm + 4,
    minHeight: 84,
    justifyContent: 'space-between',
  },
  textInput: {
    fontSize: 14.5,
    lineHeight: 21,
    textAlignVertical: 'top',
    minHeight: 52,
  },
  charCounter: {
    fontSize: 11,
  },
  memoCardContainer: {
    borderRadius: BorderRadius.card,
    borderWidth: 1.2,
    padding: Spacing.md,
    minHeight: 140,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 1,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  memoPin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memoTextInput: {
    fontSize: 15.5,
    lineHeight: 24,
    textAlignVertical: 'top',
    minHeight: 75,
  },
  memoFooter: {
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  moodHeroBox: {
    borderRadius: BorderRadius.card,
    borderWidth: 1.2,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodHeroEmoji: {
    fontSize: 44,
    lineHeight: 50,
    marginBottom: 4,
  },
  moodHeroLabel: {
    fontSize: 18,
    marginBottom: 2,
    textAlign: 'center',
  },
  moodHeroSubtitle: {
    paddingHorizontal: Spacing.md,
    fontSize: 12,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 3,
  },
  visibilityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    gap: 5,
    minHeight: 38,
  },
  footerAction: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  primaryCta: {
    height: 50,
  },
  primaryCtaDisabled: {
    opacity: 0.5,
  },
});
