import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption, Title } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { interactionsService } from '../../services/modules/interactions.service';
import { useQueryClient } from '@tanstack/react-query';
import { momentKeys } from '../../hooks/use-moments';

export interface QuickCommentModalProps {
  visible: boolean;
  momentId?: string;
  recipientName?: string;
  onClose: () => void;
  onCommentSuccess?: () => void;
}

export function QuickCommentModal({
  visible,
  momentId,
  recipientName,
  onClose,
  onCommentSuccess,
}: QuickCommentModalProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!momentId || !commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await interactionsService.addComment(momentId, commentText.trim());
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: momentKeys.today() });
      onCommentSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.sheetContainer,
                  {
                    backgroundColor: isDark ? '#242220' : '#FFFFFF',
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.sheetHeader}>
                  <View style={styles.headerTitleContainer}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color={colors.accentDark}
                    />
                    <Body weight="bold" color="primary">
                      {recipientName
                        ? `${t('moments.sendMessagePlaceholder', 'Gửi tin nhắn')} @${recipientName}`
                        : t('moments.sendMessagePlaceholder', 'Gửi tin nhắn')}
                    </Body>
                  </View>

                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Quick Emoji Bar */}
                <View style={styles.quickEmojiRow}>
                  {['🔥', '💛', '🥰', '✨', '👏', '☕', '❤️'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => handleQuickEmoji(emoji)}
                      style={[
                        styles.emojiPill,
                        { backgroundColor: colors.surfaceSoft },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Body style={styles.emojiText}>{emoji}</Body>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Input & Send Button */}
                <View
                  style={[
                    styles.inputRow,
                    {
                      backgroundColor: colors.surfaceSoft,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder={t('moments.sendMessagePlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    autoFocus
                    maxLength={300}
                  />

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!commentText.trim() || isSubmitting}
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor: commentText.trim()
                          ? colors.accentDark
                          : colors.surfaceSoft,
                        opacity: commentText.trim() ? 1 : 0.5,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name="arrow-up"
                        size={18}
                        color={commentText.trim() ? '#FFFFFF' : colors.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md + 4,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  quickEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  emojiPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Platform.OS === 'ios' ? Spacing.xs : 2,
    minHeight: 46,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});
