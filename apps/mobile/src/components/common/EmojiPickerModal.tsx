import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from './Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption, Title } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { triggerHapticFeedback } from '../../utils/haptics';

export interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  selectedEmoji?: string | null;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'popular',
    name: 'Phổ biến',
    icon: 'flame-outline',
    emojis: [
      '❤️', '🔥', '😂', '🥰', '😍', '✨', '🥺', '😭', '🙌', '👏', '🎉', '💯',
      '👍', '🤩', '😎', '🤤', '🤔', '🥳', '💩', '🤡', '💖', '⭐', '☕', '👀',
    ],
  },
  {
    id: 'smileys',
    name: 'Cảm xúc',
    icon: 'happy-outline',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
      '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝',
      '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
      '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
      '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓',
      '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
      '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱',
      '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '💩', '🤡', '👻', '👽', '🤖',
    ],
  },
  {
    id: 'hearts_gestures',
    name: 'Cử chỉ & Tim',
    icon: 'heart-outline',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
      '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '💯', '💢', '💥',
      '💫', '💦', '💨', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐',
      '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
      '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄',
    ],
  },
  {
    id: 'symbols_fun',
    name: 'Biểu tượng',
    icon: 'sparkles-outline',
    emojis: [
      '✨', '⭐', '🌟', '💫', '🔥', '⚡', '🌈', '☀️', '🌙', '☁️', '❄️', '🎉',
      '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾',
      '🏐', '🎱', '🎮', '🎯', '🎲', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎸',
      '🎺', '🎻', '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸',
      '🍹', '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫',
      '🍬', '🍭', '🌸', '🌹', '🌻', '🍀', '🍁', '🍄', '🐶', '🐱', '🐰', '🦊',
    ],
  },
];

export function EmojiPickerModal({
  visible,
  onClose,
  onSelectEmoji,
  selectedEmoji,
}: EmojiPickerModalProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('popular');

  const currentCategory = useMemo(() => {
    return EMOJI_CATEGORIES.find((cat) => cat.id === activeTab) || EMOJI_CATEGORIES[0];
  }, [activeTab]);

  const handleSelect = (emoji: string) => {
    triggerHapticFeedback();
    onSelectEmoji(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
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
              {/* Drag Handle Indicator */}
              <View style={styles.handleIndicator} />

              {/* Header */}
              <View style={styles.header}>
                <Title level={3} color="primary" weight="bold">
                  {t('chat.chooseReaction', 'Chọn cảm xúc')}
                </Title>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceSoft }]}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Category Tabs */}
              <View style={[styles.tabsRow, { borderBottomColor: colors.divider }]}>
                {EMOJI_CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      onPress={() => {
                        triggerHapticFeedback();
                        setActiveTab(cat.id);
                      }}
                      style={[
                        styles.tabButton,
                        isActive && [
                          styles.tabButtonActive,
                          {
                            backgroundColor: isDark ? '#383430' : '#F4EFE6',
                            borderColor: colors.accentDark,
                          },
                        ],
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={15}
                        color={isActive ? colors.accentDark : colors.textSecondary}
                      />
                      <Caption
                        weight={isActive ? 'bold' : 'medium'}
                        style={{
                          fontSize: 12,
                          color: isActive ? colors.accentDark : colors.textSecondary,
                        }}
                      >
                        {cat.name}
                      </Caption>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Emoji Grid */}
              <FlatList
                data={currentCategory.emojis}
                keyExtractor={(item, index) => `${item}_${index}`}
                numColumns={6}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item: emoji }) => {
                  const isSelected = selectedEmoji === emoji;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.emojiCell,
                        isSelected && [
                          styles.emojiCellSelected,
                          {
                            backgroundColor: isDark ? '#3D2F24' : '#FFEBD8',
                            borderColor: colors.accentDark,
                          },
                        ],
                      ]}
                      activeOpacity={0.6}
                      onPress={() => handleSelect(emoji)}
                    >
                      <Body style={styles.emojiText}>{emoji}</Body>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    height: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8C4BD',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    borderWidth: 1,
  },
  gridContainer: {
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  emojiCellSelected: {
    borderWidth: 1.5,
  },
  emojiText: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
