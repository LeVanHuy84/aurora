import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {
  scheduleDailyReminderNotification,
  cancelDailyReminderNotification,
} from '../hooks/use-push-notifications';
import { usersService } from '../services/modules/users.service';

const STORAGE_KEYS = {
  DAILY_REMINDER: 'aurora_setting_daily_reminder',
  REACTION_MOMENTS: 'aurora_setting_reaction_moments',
};

interface SettingsState {
  dailyReminder: boolean;
  reactionMoments: boolean;
  isLoaded: boolean;
  setDailyReminder: (enabled: boolean) => Promise<void>;
  setReactionMoments: (enabled: boolean) => Promise<void>;
  initSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, _get) => ({
  dailyReminder: true,
  reactionMoments: true,
  isLoaded: false,

  initSettings: async () => {
    try {
      const [dailyRem, reactMoments] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.DAILY_REMINDER),
        SecureStore.getItemAsync(STORAGE_KEYS.REACTION_MOMENTS),
      ]);

      const dailyReminder = dailyRem !== null ? dailyRem === 'true' : true;
      const reactionMoments = reactMoments !== null ? reactMoments === 'true' : true;

      set({
        dailyReminder,
        reactionMoments,
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

  setReactionMoments: async (enabled: boolean) => {
    set({ reactionMoments: enabled });
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REACTION_MOMENTS, String(enabled));
      // Sync setting with backend
      await usersService.updateMe({ notifyReactions: enabled });
    } catch (err) {
      console.warn('[SettingsStore] Error saving reaction moments setting:', err);
    }
  },
}));
