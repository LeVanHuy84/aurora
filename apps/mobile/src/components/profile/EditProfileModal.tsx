import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Ionicons } from '../common/Icon';
import { useUpdateProfile } from '../../hooks/use-user-profile';
import { UserProfile } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface EditProfileModalProps {
  visible: boolean;
  user?: UserProfile | null;
  onClose: () => void;
}

export function EditProfileModal({ visible, user, onClose }: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setErrorMessage('');
    }
  }, [user, visible]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setErrorMessage(t('auth.errors.displayNameRequired', 'Vui lòng nhập tên hiển thị.'));
      return;
    }

    setErrorMessage('');
    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });

      Alert.alert(t('common.appName', 'Aurora'), t('profile.saveSuccess', 'Cập nhật thành công!'));
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || t('common.error', 'Có lỗi xảy ra'));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.divider,
              paddingTop: Math.max(insets.top, 24) + Spacing.sm,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceSoft }]}
          >
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Title level={3} style={styles.headerTitle}>
            {t('profile.editProfileTitle', 'Chỉnh sửa hồ sơ')}
          </Title>

          <View style={styles.placeholderBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Caption color="danger">{errorMessage}</Caption>
            </View>
          ) : null}

          {/* Display Name input */}
          <View style={styles.fieldGroup}>
            <Caption weight="bold" color="primary" style={styles.fieldLabel}>
              {t('profile.displayName', 'Tên hiển thị')}
            </Caption>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('auth.displayNamePlaceholder', 'vd: Huy Lê')}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.textPrimary }]}
              />
            </View>
          </View>

          {/* Bio input */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Caption weight="bold" color="primary" style={styles.fieldLabel}>
                {t('profile.bio', 'Tiểu sử cá nhân')}
              </Caption>
              <Caption color="muted" style={{ fontSize: 11 }}>
                {bio.length}/200
              </Caption>
            </View>
            <View
              style={[
                styles.bioInputWrapper,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <TextInput
                multiline
                numberOfLines={3}
                value={bio}
                onChangeText={(text) => {
                  if (text.length <= 200) setBio(text);
                }}
                placeholder={t(
                  'profile.bioPlaceholder',
                  'Viết vài dòng chia sẻ về bản thân bạn...',
                )}
                placeholderTextColor={colors.textMuted}
                style={[styles.bioInput, { color: colors.textPrimary }]}
              />
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title={t('common.save', 'Lưu lại')}
            variant="primary"
            size="lg"
            loading={updateProfile.isPending}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
  },
  placeholderBtn: {
    width: 34,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  errorBox: {
    padding: Spacing.sm,
    backgroundColor: '#E6394615',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6394633',
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 13,
  },
  inputWrapper: {
    borderRadius: BorderRadius.sm + 4,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 48,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14.5,
  },
  bioInputWrapper: {
    borderRadius: BorderRadius.sm + 4,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 90,
  },
  bioInput: {
    fontSize: 14.5,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
