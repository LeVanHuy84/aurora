import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
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

  // Active Tab
  const [momentType, setMomentType] = useState<MomentType>(MomentType.PHOTO);

  // 1. Photo Tab State
  const [photoState, setPhotoState] = useState<{
    image: string | null;
    caption: string;
    emotion: EmotionItem | null;
  }>({
    image: null,
    caption: '',
    emotion: null,
  });

  // 2. Note Tab State
  const [noteState, setNoteState] = useState<{
    content: string;
    emotion: EmotionItem | null;
  }>({
    content: '',
    emotion: null,
  });

  // 3. Mood Tab State
  const [moodState, setMoodState] = useState<{
    emotion: EmotionItem | null;
    content: string;
  }>({
    emotion: null,
    content: '',
  });

  // Common Settings
  const [visibility, setVisibility] = useState<Visibility>(Visibility.CLOSE_FRIENDS);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset all states helper
  const resetAllStates = useCallback(() => {
    setMomentType(MomentType.PHOTO);
    setPhotoState({ image: null, caption: '', emotion: null });
    setNoteState({ content: '', emotion: null });
    setMoodState({ emotion: null, content: '' });
    setVisibility(Visibility.CLOSE_FRIENDS);
    setErrorMessage('');
    setIsUploading(false);
  }, []);

  // Release/reset states whenever user navigates away from Create tab
  useFocusEffect(
    useCallback(() => {
      return () => {
        resetAllStates();
      };
    }, [resetAllStates]),
  );

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
        setPhotoState((prev) => ({ ...prev, image: result.assets[0].uri }));
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
        setPhotoState((prev) => ({ ...prev, image: result.assets[0].uri }));
        setErrorMessage('');
      }
    } catch (err: any) {
      console.warn('Camera capture error', err);
    }
  };

  const handleClose = () => {
    resetAllStates();
    router.replace('/(tabs)');
  };

  // Validation check for primary CTA
  const isSubmitDisabled =
    (momentType === MomentType.PHOTO && !photoState.image) ||
    (momentType === MomentType.NOTE && !noteState.content.trim()) ||
    (momentType === MomentType.MOOD && !moodState.emotion);

  // Submit Handler
  const handleShareMoment = async () => {
    setErrorMessage('');

    if (momentType === MomentType.PHOTO && !photoState.image) {
      setErrorMessage(t('moments.errors.photoRequired'));
      return;
    }

    if (momentType === MomentType.NOTE && !noteState.content.trim()) {
      setErrorMessage(t('moments.errors.contentRequired'));
      return;
    }

    if (momentType === MomentType.MOOD && !moodState.emotion) {
      setErrorMessage(t('moments.errors.emotionRequired'));
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl: string | undefined = undefined;
      let finalContent: string | undefined = undefined;
      let finalEmotionId: string | undefined = undefined;

      if (momentType === MomentType.PHOTO) {
        finalImageUrl = await mediaService.uploadImage(photoState.image!);
        finalContent = photoState.caption.trim() || undefined;
        finalEmotionId = photoState.emotion
          ? photoState.emotion.id || photoState.emotion.code
          : undefined;
      } else if (momentType === MomentType.NOTE) {
        finalContent = noteState.content.trim();
        finalEmotionId = noteState.emotion
          ? noteState.emotion.id || noteState.emotion.code
          : undefined;
      } else if (momentType === MomentType.MOOD) {
        finalContent = moodState.content.trim() || undefined;
        finalEmotionId = moodState.emotion!.id || moodState.emotion!.code;
      }

      await createMoment.mutateAsync({
        type: momentType,
        content: finalContent,
        imageUrl: finalImageUrl,
        emotionId: finalEmotionId,
        visibility,
      });

      resetAllStates();
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
          selectedImage={photoState.image}
          content={photoState.caption}
          selectedEmotion={photoState.emotion}
          onChangeContent={(text) => setPhotoState((prev) => ({ ...prev, caption: text }))}
          onRemoveImage={() => setPhotoState((prev) => ({ ...prev, image: null }))}
          onCaptureCamera={handleCaptureCamera}
          onPickFromGallery={handlePickFromGallery}
          onSelectEmotion={(emotion) => setPhotoState((prev) => ({ ...prev, emotion }))}
        />
      )}

      {momentType === MomentType.NOTE && (
        <NoteMomentForm
          content={noteState.content}
          selectedEmotion={noteState.emotion}
          onChangeContent={(text) => setNoteState((prev) => ({ ...prev, content: text }))}
          onSelectEmotion={(emotion) => setNoteState((prev) => ({ ...prev, emotion }))}
        />
      )}

      {momentType === MomentType.MOOD && (
        <MoodMomentForm
          selectedEmotion={moodState.emotion}
          content={moodState.content}
          onSelectEmotion={(emotion) => setMoodState((prev) => ({ ...prev, emotion }))}
          onChangeContent={(text) => setMoodState((prev) => ({ ...prev, content: text }))}
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
