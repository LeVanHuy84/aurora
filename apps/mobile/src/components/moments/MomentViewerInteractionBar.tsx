import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ReactionType } from '@aurora/types';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { triggerHapticFeedback } from '../../utils/haptics';

export interface MomentViewerInteractionBarProps {
  hasReacted: boolean;
  userReactionType?: string | null;
  onReactionPress: (emoji: string, type: ReactionType) => void;
  onOpenDirectChat: () => void;
  isOpeningChat: boolean;
}

const REACTION_OPTIONS = [
  { emoji: '❤️', type: ReactionType.LOVE },
  { emoji: '🔥', type: ReactionType.PROUD },
  { emoji: '🥰', type: ReactionType.CARE },
  { emoji: '💛', type: ReactionType.RELATABLE },
  { emoji: '✨', type: ReactionType.FUNNY },
];

export function MomentViewerInteractionBar({
  hasReacted,
  userReactionType,
  onReactionPress,
  onOpenDirectChat,
  isOpeningChat,
}: MomentViewerInteractionBarProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* ROW 1: 5 REACTION EMOJIS */}
      <View
        style={[
          styles.reactionBar,
          {
            backgroundColor: isDark ? '#242220' : '#F5F2EB',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {REACTION_OPTIONS.map((item) => {
          const isSelected = hasReacted && userReactionType === item.type;
          return (
            <TouchableOpacity
              key={item.emoji}
              style={[
                styles.reactionBtn,
                isSelected && [
                  styles.reactionBtnSelected,
                  {
                    backgroundColor: isDark ? '#383531' : '#FFFFFF',
                    shadowColor: '#000',
                  },
                ],
              ]}
              activeOpacity={0.6}
              onPress={() => {
                triggerHapticFeedback();
                onReactionPress(item.emoji, item.type);
              }}
            >
              <Body
                style={[
                  styles.reactionEmoji,
                  isSelected && styles.reactionEmojiSelected,
                  !isSelected && hasReacted && styles.reactionEmojiUnselected,
                ]}
              >
                {item.emoji}
              </Body>
              {isSelected && (
                <View
                  style={[
                    styles.selectedDot,
                    { backgroundColor: colors.accentDark },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ROW 2: FULL-WIDTH PRIVATE CHAT BAR */}
      <TouchableOpacity
        style={[
          styles.chatInputBar,
          {
            backgroundColor: isDark ? '#242220' : '#F5F2EB',
            borderColor: colors.cardBorder,
          },
        ]}
        activeOpacity={0.75}
        onPress={() => {
          triggerHapticFeedback();
          onOpenDirectChat();
        }}
        disabled={isOpeningChat}
      >
        <View style={styles.chatLeftGroup}>
          {isOpeningChat ? (
            <ActivityIndicator
              size="small"
              color={colors.accentDark}
              style={{ marginRight: 8 }}
            />
          ) : (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={19}
              color={colors.textSecondary}
              style={{ marginRight: 8 }}
            />
          )}
          <Body color="secondary" style={styles.placeholderText}>
            {t('moments.sendMessagePlaceholder', 'Gửi tin nhắn riêng...')}
          </Body>
        </View>

        <View
          style={[
            styles.sendIconCircle,
            { backgroundColor: colors.accentDark },
          ]}
        >
          <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs + 2,
    marginTop: Spacing.xs,
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 56,
    paddingVertical: 4,
    paddingHorizontal: Spacing.xs,
    overflow: 'visible',
  },
  reactionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  reactionBtnSelected: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  reactionEmoji: {
    fontSize: 24,
    lineHeight: 32,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  reactionEmojiSelected: {
    transform: [{ scale: 1.15 }],
  },
  reactionEmojiUnselected: {
    opacity: 0.65,
  },
  selectedDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    height: 50,
    paddingLeft: Spacing.md,
    paddingRight: 6,
  },
  chatLeftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '500',
  },
  sendIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
