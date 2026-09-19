import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { useCreateMoment } from '../../src/hooks/use-moments';
import { mediaService } from '../../src/services/modules/media.service';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Button } from '../../src/components/ui/Button';
import { Body } from '../../src/components/ui/Typography';
import { CreateMomentHeader } from '../../src/components/create/CreateMomentHeader';
import { MomentTypeSegment } from '../../src/components/create/MomentTypeSegment';
import { PhotoMomentForm } from '../../src/components/create/PhotoMomentForm';
import { NoteMomentForm } from '../../src/components/create/NoteMomentForm';
import { MoodMomentForm } from '../../src/components/create/MoodMomentForm';
import { VisibilitySelector } from '../../src/components/create/VisibilitySelector';
import { EmotionItem, MomentType, Visibility } from '@aurora/types';
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
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionItem | null>(null);
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

      if (momentType === MomentType.PHOTO && selectedImage) {
        finalImageUrl = await mediaService.uploadImage(selectedImage);
      }

      await createMoment.mutateAsync({
        type: momentType,
        content: content.trim() || undefined,
        imageUrl: finalImageUrl,
        emotionId: selectedEmotion ? (selectedEmotion.id || selectedEmotion.code) : undefined,
        visibility,
      });

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
      edges={['top']}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      header={<CreateMomentHeader onClose={handleClose} />}
    >
      {/* 1. Moment Type Segmented Selector */}
      <MomentTypeSegment
        selectedType={momentType}
        onSelectType={(type) => {
          setMomentType(type);
          setErrorMessage('');
        }}
      />

      {/* Error Message Banner */}
      {errorMessage ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: isDark ? '#2D1618' : '#FDE8E8', borderColor: colors.danger },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Body color="danger" weight="medium" style={styles.errorText}>
            {errorMessage}
          </Body>
        </View>
      ) : null}

      {/* 2. Type-specific Form Component */}
      {momentType === MomentType.PHOTO && (
        <PhotoMomentForm
          selectedImage={selectedImage}
          content={content}
          onChangeContent={setContent}
          onRemoveImage={() => setSelectedImage(null)}
          onCaptureCamera={handleCaptureCamera}
          onPickFromGallery={handlePickFromGallery}
        />
      )}

      {momentType === MomentType.NOTE && (
        <NoteMomentForm
          content={content}
          onChangeContent={setContent}
        />
      )}

      {momentType === MomentType.MOOD && (
        <MoodMomentForm
          selectedEmotion={selectedEmotion}
          content={content}
          onSelectEmotion={setSelectedEmotion}
          onChangeContent={setContent}
        />
      )}

      {/* 3. Visibility Selector */}
      <VisibilitySelector
        visibility={visibility}
        onSelectVisibility={setVisibility}
      />

      {/* 4. Primary Share Button */}
      <View style={styles.footerAction}>
        <Button
          title={
            isUploading
              ? t('moments.sharingProgress', 'Đang đăng...')
              : t('moments.shareMomentBtn', 'Chia sẻ khoảnh khắc')
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
  container: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl * 2,
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
  footerAction: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  primaryCta: {
    height: 52,
    borderRadius: BorderRadius.full,
  },
  primaryCtaDisabled: {
    opacity: 0.5,
  },
});
