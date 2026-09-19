import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { Spacing } from '../../src/constants/theme';

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentDark,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: Spacing.xs + 2,
          paddingTop: Spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Tab 1: Today */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'sunny' : 'sunny-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 2: Memories */}
      <Tabs.Screen
        name="memories"
        options={{
          title: t('tabs.memories'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 3: Create (+) */}
      <Tabs.Screen
        name="create"
        options={{
          title: t('tabs.create'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={26}
              color={colors.accentDark}
            />
          ),
        }}
      />

      {/* Tab 4: Me / Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.me'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
