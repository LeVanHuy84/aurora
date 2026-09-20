import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {
  scheduleDailyReminderNotification,
  cancelDailyReminderNotification,
} from '../hooks/use-push-notifications';

const STORAGE_KEYS = {
  DAILY_REMINDER: 'aurora_setting_daily_reminder',
  CLOSE_FRIENDS_MOMENTS: 'aurora_setting_close_friends_moments',
  ALL_FRIENDS_MOMENTS: 'aurora_setting_all_friends_moments',
};

interface SettingsState {
  dailyReminder: boolean;
  closeFriendsMoments: boolean;
  allFriendsMoments: boolean;
  isLoaded: boolean;
  setDailyReminder: (enabled: boolean) => Promise<void>;
  setCloseFriendsMoments: (enabled: boolean) => Promise<void>;
  setAllFriendsMoments: (enabled: boolean) => Promise<void>;
  initSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  dailyReminder: true,
  closeFriendsMoments: true,
  allFriendsMoments: true,
  isLoaded: false,

  initSettings: async () => {
    try {
      const [dailyRem, cfMoments, allMoments] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.DAILY_REMINDER),
        SecureStore.getItemAsync(STORAGE_KEYS.CLOSE_FRIENDS_MOMENTS),
        SecureStore.getItemAsync(STORAGE_KEYS.ALL_FRIENDS_MOMENTS),
      ]);

      const dailyReminder = dailyRem !== null ? dailyRem === 'true' : true;
      const closeFriendsMoments = cfMoments !== null ? cfMoments === 'true' : true;
      const allFriendsMoments = allMoments !== null ? allMoments === 'true' : true;

      set({
        dailyReminder,
        closeFriendsMoments,
        allFriendsMoments,
        isLoaded: true,
      });

      // Đảm bảo schedule daily reminder nếu đang bật
      if (dailyReminder) {
        await scheduleDailyReminderNotification(20, 0);
      }
    } catch (err) {
      console.warn('[SettingsStore] Error loading settings:', err);
      set({ isLoaded: true });
    }
  },

  setDailyReminder: async (enabled: boolean) => {
    set({ dailyReminder: enabled });
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.DAILY_REMINDER, String(enabled));
      if (enabled) {
        await scheduleDailyReminderNotification(20, 0);
      } else {
        await cancelDailyReminderNotification();
      }
    } catch (err) {
      console.warn('[SettingsStore] Error saving daily reminder setting:', err);
    }
  },

  setCloseFriendsMoments: async (enabled: boolean) => {
    set({ closeFriendsMoments: enabled });
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.CLOSE_FRIENDS_MOMENTS, String(enabled));
    } catch (err) {
      console.warn('[SettingsStore] Error saving close friends setting:', err);
    }
  },

  setAllFriendsMoments: async (enabled: boolean) => {
    set({ allFriendsMoments: enabled });
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ALL_FRIENDS_MOMENTS, String(enabled));
    } catch (err) {
      console.warn('[SettingsStore] Error saving all friends setting:', err);
    }
  },
}));
