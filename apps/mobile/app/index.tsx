import { Text, View, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aurora Mobile App</Text>
      <Text style={styles.subtitle}>Expo SDK 57 + TypeScript + Expo Router</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
});
