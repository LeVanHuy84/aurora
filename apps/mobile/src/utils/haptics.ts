import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHapticFeedback = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.impactAsync(style);
  } catch {
    // Graceful fallback on unsupported devices
  }
};

export const triggerSelectionFeedback = () => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.selectionAsync();
  } catch {
    // Graceful fallback
  }
};
