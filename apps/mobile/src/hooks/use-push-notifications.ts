import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { usersService } from '../services/modules/users.service';

const isAndroidExpoGo =
  Platform.OS === 'android' &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Dynamic loader để tránh load expo-notifications trên Android Expo Go (SDK 53+ ném fatal exception tại module level)
function getNotificationsModule() {
  if (isAndroidExpoGo || Platform.OS === 'web') {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-notifications') as typeof import('expo-notifications');
  } catch (e) {
    return null;
  }
}

const Notifications = getNotificationsModule();

// Cấu hình notification handler nếu hỗ trợ
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn('[PushNotification] Error setting notification handler:', err);
  }
}

export function usePushNotifications() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    if (isAndroidExpoGo || !Notifications) {
      console.log(
        '[PushNotification] Android Expo Go detected. Push notifications are disabled in Expo Go on Android (SDK 53+). Use an EAS Development Build to test push.',
      );
      return;
    }

    // 1. Đăng ký & lấy Token
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          console.log('[PushNotification] Obtained token:', token);
          usersService
            .updatePushToken(token)
            .then(() => {
              console.log('[PushNotification] Push token synced to backend successfully! 🎉');
            })
            .catch((err) => {
              console.warn('[PushNotification] Failed to sync push token to backend:', err);
            });
        }
      })
      .catch((err) => {
        console.warn('[PushNotification] Registration error:', err);
      });

    // 2. Lắng nghe thông báo khi nhận được (Foreground)
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log('[PushNotification] Received foreground notification:', notification.request.content);
      });
    } catch (err) {
      console.warn('[PushNotification] Could not add notification received listener:', err);
    }

    // 3. Xử lý khi User click/tap vào thông báo
    try {
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<string, any> | undefined;

        if (!data?.type) return;

        switch (data.type) {
          case 'NEW_MOMENT':
            router.push('/(tabs)');
            break;
          case 'CHAT_MESSAGE':
            if (data.conversationId) {
              router.push(`/chat/${data.conversationId}` as any);
            } else {
              router.push('/inbox');
            }
            break;
          case 'DAILY_REMINDER':
            router.push('/(tabs)/create');
            break;
          case 'MOMENT_REACTION':
          case 'MOMENT_COMMENT':
            router.push('/(tabs)');
            break;
          case 'FRIEND_REQUEST':
            router.push('/inbox');
            break;
          default:
            break;
        }
      });
    } catch (err) {
      console.warn('[PushNotification] Could not add response listener:', err);
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove?.();
      }
      if (responseListener.current) {
        responseListener.current.remove?.();
      }
    };
  }, [isAuthenticated, user?.id]);
}

/**
 * Hàm đăng ký xin quyền và lấy Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  const notif = getNotificationsModule();
  if (!notif || Platform.OS === 'web') {
    return null;
  }

  try {
    // Cấu hình Android Notification Channels
    if (Platform.OS === 'android') {
      await notif.setNotificationChannelAsync('default', {
        name: 'Default Notifications',
        importance: notif.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });

      await notif.setNotificationChannelAsync('chat', {
        name: 'Chat Messages',
        importance: notif.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ECDC4',
        sound: 'default',
      });
    }

    // Kiểm tra thiết bị thật
    if (!Device.isDevice) {
      console.log('[PushNotification] Running on simulator/emulator, push token might be empty.');
    }

    const { status: existingStatus } = await notif.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notif.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log(`[PushNotification] Permission not granted (current status: ${finalStatus}). On iOS, please enable notifications in Settings > Expo Go.`);
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      'cdf46ce7-0a4f-4a02-94c1-635d35fc6482';

    const tokenData = await notif.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    console.warn('[PushNotification] Error getting Expo push token:', error);
    return null;
  }
}

export const DAILY_REMINDER_NOTIFICATION_ID = 'aurora-daily-reminder-20h';

/**
 * Đặt lịch thông báo nhắc nhở nhật ký hàng ngày (Local Notification)
 */
export async function scheduleDailyReminderNotification(hour = 20, minute = 0): Promise<boolean> {
  const notif = getNotificationsModule();
  if (!notif || Platform.OS === 'web') return false;

  try {
    // 1. Hủy lịch cũ nếu có
    await cancelDailyReminderNotification();

    // 2. Đảm bảo quyền thông báo
    const { status } = await notif.getPermissionsAsync();
    if (status !== 'granted') {
      const requestRes = await notif.requestPermissionsAsync();
      if (requestRes.status !== 'granted') {
        return false;
      }
    }

    // 3. Đặt lịch hàng ngày (repeats = true)
    await notif.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_NOTIFICATION_ID,
      content: {
        title: '✨ Hôm nay của bạn thế nào?',
        body: 'Dành 1 phút ghi lại khoảnh khắc và cảm xúc của bạn cùng Aurora nhé 📸',
        sound: 'default',
        priority: notif.AndroidNotificationPriority?.HIGH ?? 'high',
        data: {
          type: 'DAILY_REMINDER',
        },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });

    console.log(`[PushNotification] Daily reminder scheduled at ${hour}:${minute < 10 ? '0' : ''}${minute}`);
    return true;
  } catch (err) {
    console.warn('[PushNotification] Failed to schedule daily reminder:', err);
    return false;
  }
}

/**
 * Hủy lịch nhắc nhở nhật ký hàng ngày
 */
export async function cancelDailyReminderNotification(): Promise<void> {
  const notif = getNotificationsModule();
  if (!notif || Platform.OS === 'web') return;

  try {
    await notif.cancelScheduledNotificationAsync(DAILY_REMINDER_NOTIFICATION_ID);
    console.log('[PushNotification] Daily reminder cancelled');
  } catch (err) {
    console.warn('[PushNotification] Failed to cancel daily reminder:', err);
  }
}

