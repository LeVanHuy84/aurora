import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Body, Caption } from '../ui/Typography';
import { Spacing } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-theme';

export interface MomentCaptionProps {
  content?: string | null;
  username?: string | null;
}

export function MomentCaption({ content, username }: MomentCaptionProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  if (!content || !content.trim()) return null;

  return (
    <View style={styles.container}>
      <Body
        color="primary"
        numberOfLines={isExpanded ? undefined : 2}
        onTextLayout={(e) => {
          if (e.nativeEvent.lines.length > 2) {
            setIsTruncated(true);
          }
        }}
        style={styles.captionText}
      >
        {username ? (
          <Body weight="bold" color="primary" style={styles.usernamePrefix}>
            {username}{' '}
          </Body>
        ) : null}
        {content.trim()}
      </Body>

      {isTruncated && (
        <TouchableOpacity
          onPress={() => setIsExpanded((prev) => !prev)}
          activeOpacity={0.6}
          style={styles.moreButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Caption
            weight="semibold"
            style={[styles.moreText, { color: colors.textSecondary }]}
          >
            {isExpanded
              ? t('common.less', 'Thu gọn')
              : t('common.more', '... Xem thêm')}
          </Caption>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 6,
    marginTop: 2,
    marginBottom: Spacing.xs + 2,
  },
  captionText: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.1,
    fontWeight: '400',
  },
  usernamePrefix: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  moreButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  moreText: {
    fontSize: 13,
  },
});
