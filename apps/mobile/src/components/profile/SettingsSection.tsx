import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme, ThemeMode } from '../../hooks/use-theme';
import { useSettingsStore } from '../../stores/settings.store';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface SettingsSectionProps {
  friendsCount: number;
  pendingRequestsCount: number;
  onOpenFriends: () => void;
  onLogout: () => void;
}

export function SettingsSection({
  friendsCount,
  pendingRequestsCount,
  onOpenFriends,
  onLogout,
}: SettingsSectionProps) {
  const { colors, isDark, mode, setMode } = useAppTheme();
  const { t, i18n } = useTranslation();

  const {
    dailyReminder,
    reactionMoments,
    isLoaded,
    setDailyReminder,
    setReactionMoments,
    initSettings,
  } = useSettingsStore();

  useEffect(() => {
    if (!isLoaded) {
      initSettings();
    }
  }, [isLoaded, initSettings]);

  const currentLang = i18n.language.startsWith('vi') ? 'vi' : 'en';

  const handleChangeLanguage = (lang: 'vi' | 'en') => {
    i18n.changeLanguage(lang);
  };

  const handleLogoutPress = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle', 'Đăng xuất tài khoản'),
      t('profile.logoutConfirmMessage', 'Bạn có chắc chắn muốn đăng xuất khỏi Aurora không?'),
      [
        { text: t('common.cancel', 'Hủy'), style: 'cancel' },
        {
          text: t('auth.logout', 'Đăng xuất'),
          style: 'destructive',
          onPress: onLogout,
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Title level={3} style={styles.sectionHeader}>
        {t('profile.settingsTitle', 'Cài đặt & Tùy chọn')}
      </Title>

      {/* 1. Friends Manager Action Row */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenFriends}
        style={[
          styles.cardRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.rowLeft}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: isDark ? '#2B231D' : '#FFF2E4' },
            ]}
          >
            <Ionicons name="people" size={18} color={colors.accentDark} />
          </View>
          <View>
            <Body weight="bold" color="primary" style={styles.rowTitle}>
              {t('profile.friendsSetting', 'Bạn bè & Bạn thân')}
            </Body>
            <Caption color="muted" style={styles.rowSubtitle}>
              {t('profile.friendsSettingSubtitle', {
                count: friendsCount,
                defaultValue: `${friendsCount} bạn bè đã kết nối`,
              })}
            </Caption>
          </View>
        </View>

        <View style={styles.rowRight}>
          {pendingRequestsCount > 0 && (
            <View
              style={[
                styles.pendingBadge,
                { backgroundColor: colors.accentDark },
              ]}
            >
              <Caption color="white" weight="bold" style={{ fontSize: 11 }}>
                +{pendingRequestsCount}
              </Caption>
            </View>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      {/* 2. Appearance / Theme Card */}
      <View
        style={[
          styles.cardBlock,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.blockHeader}>
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isDark ? '#27252F' : '#F1EDFA' },
              ]}
            >
              <Ionicons name="moon" size={17} color="#8E7DBE" />
            </View>
            <Body weight="bold" color="primary" style={styles.rowTitle}>
              {t('profile.themeSetting', 'Giao diện')}
            </Body>
          </View>
        </View>

        {/* 3-segment Theme Selector */}
        <View
          style={[
            styles.segmentTrack,
            { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
          ]}
        >
          {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => {
            const isSelected = mode === m;
            const label =
              m === 'light'
                ? t('profile.themeLight', 'Sáng')
                : m === 'dark'
                ? t('profile.themeDark', 'Tối')
                : t('profile.themeSystem', 'Hệ thống');

            const iconName =
              m === 'light' ? 'sunny' : m === 'dark' ? 'moon' : 'phone-portrait';

            return (
              <TouchableOpacity
                key={m}
                activeOpacity={0.8}
                onPress={() => setMode(m)}
                style={[
                  styles.segmentBtn,
                  isSelected && [
                    styles.segmentBtnActive,
                    { backgroundColor: colors.card },
                  ],
                ]}
              >
                <Ionicons
                  name={iconName as any}
                  size={13}
                  color={isSelected ? colors.accentDark : colors.textMuted}
                />
                <Caption
                  weight={isSelected ? 'bold' : 'medium'}
                  style={{
                    fontSize: 12,
                    color: isSelected ? colors.textPrimary : colors.textSecondary,
                  }}
                >
                  {label}
                </Caption>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Language Selector Card */}
      <View
        style={[
          styles.cardBlock,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.blockHeader}>
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isDark ? '#1C2925' : '#EBF7F4' },
              ]}
            >
              <Ionicons name="globe" size={17} color={colors.closeFriends} />
            </View>
            <Body weight="bold" color="primary" style={styles.rowTitle}>
              {t('profile.languageSetting', 'Ngôn ngữ')}
            </Body>
          </View>
        </View>

        {/* 2-segment Language Selector */}
        <View
          style={[
            styles.segmentTrack,
            { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleChangeLanguage('vi')}
            style={[
              styles.segmentBtn,
              currentLang === 'vi' && [
                styles.segmentBtnActive,
                { backgroundColor: colors.card },
              ],
            ]}
          >
            <Caption
              weight={currentLang === 'vi' ? 'bold' : 'medium'}
              style={{
                fontSize: 12.5,
                color: currentLang === 'vi' ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {t('profile.langVi', 'Tiếng Việt 🇻🇳')}
            </Caption>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleChangeLanguage('en')}
            style={[
              styles.segmentBtn,
              currentLang === 'en' && [
                styles.segmentBtnActive,
                { backgroundColor: colors.card },
              ],
            ]}
          >
            <Caption
              weight={currentLang === 'en' ? 'bold' : 'medium'}
              style={{
                fontSize: 12.5,
                color: currentLang === 'en' ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {t('profile.langEn', 'English 🇬🇧')}
            </Caption>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Notifications Switches Card */}
      <View
        style={[
          styles.cardBlock,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.blockHeader}>
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: isDark ? '#2E221E' : '#FFF0ED' },
              ]}
            >
              <Ionicons name="notifications" size={17} color={colors.accent} />
            </View>
            <Body weight="bold" color="primary" style={styles.rowTitle}>
              {t('profile.notificationSetting', 'Thông báo')}
            </Body>
          </View>
        </View>

        <View style={styles.switchRow}>
          <Caption color="primary" style={styles.switchLabel}>
            {t('profile.dailyReminder', 'Nhắc nhở nhật ký hàng ngày (20:00)')}
          </Caption>
          <Switch
            value={dailyReminder}
            onValueChange={setDailyReminder}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
            thumbColor={dailyReminder ? '#FFFFFF' : '#F4F3F0'}
          />
        </View>

        <View style={[styles.innerDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.switchRow}>
          <Caption color="primary" style={styles.switchLabel}>
            {t('profile.reactionActivity', 'Thông báo khi bạn bè thả cảm xúc')}
          </Caption>
          <Switch
            value={reactionMoments}
            onValueChange={setReactionMoments}
            trackColor={{ false: colors.surfaceSoft, true: colors.accent }}
            thumbColor={reactionMoments ? '#FFFFFF' : '#F4F3F0'}
          />
        </View>
      </View>

      {/* 5. Logout Action */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleLogoutPress}
        style={[
          styles.logoutCard,
          {
            backgroundColor: isDark ? '#2C1B1E' : '#FDF0F1',
            borderColor: '#E6394633',
          },
        ]}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Body weight="bold" style={{ color: colors.danger, fontSize: 14 }}>
          {t('auth.logout', 'Đăng xuất')}
        </Body>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm + 4,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardBlock: {
    padding: Spacing.sm + 4,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  blockHeader: {
    marginBottom: Spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
  },
  rowSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  switchLabel: {
    fontSize: 13,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  innerDivider: {
    height: 0.8,
    marginVertical: Spacing.xs + 2,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
});
