import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption } from '../ui/Typography';
import { Spacing } from '../../constants/theme';

export interface NoteMomentFormProps {
  content: string;
  onChangeContent: (text: string) => void;
}

export function NoteMomentForm({
  content,
  onChangeContent,
}: NoteMomentFormProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.memoPadCard,
          {
            backgroundColor: isDark ? '#23201D' : '#FAF6EE',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.memoHeader}>
          <View style={styles.memoTag}>
            <Ionicons name="document-text-outline" size={16} color={colors.accentDark} />
            <Body color="primary" weight="bold" style={{ fontSize: 15 }}>
              {t('moments.note', 'Ghi chú tâm tình')}
            </Body>
          </View>
          <Caption color="muted">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Caption>
        </View>

        <TextInput
          multiline
          numberOfLines={6}
          value={content}
          autoFocus
          onChangeText={(text) => {
            if (text.length <= 500) onChangeContent(text);
          }}
          placeholder={t('moments.notePlaceholder', 'Hôm nay của bạn thế nào? Hãy chia sẻ điều đang nghĩ...')}
          placeholderTextColor={colors.textMuted}
          style={[styles.memoTextInput, { color: colors.textPrimary }]}
        />

        <View style={styles.memoFooter}>
          <Caption color="muted">{content.length}/500</Caption>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  memoPadCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: Spacing.lg,
    minHeight: 220,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  memoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memoTextInput: {
    fontSize: 16.5,
    lineHeight: 25,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  memoFooter: {
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
});
