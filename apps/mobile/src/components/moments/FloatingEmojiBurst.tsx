import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';

export interface FloatingEmojiBurstProps {
  emoji: string;
  triggerKey: number;
}

interface ParticleProps {
  emoji: string;
  startX: number;
  driftX: number;
  delay: number;
  scale: number;
}

function FloatingParticle({ emoji, startX, driftX, delay, scale }: ParticleProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -280 - Math.random() * 80,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX + driftX,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(450),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    animation.start();
  }, [delay, driftX, opacity, startX, translateX, translateY]);

  return (
    <Animated.Text
      style={[
        styles.particle,
        {
          fontSize: 28 * scale,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export function FloatingEmojiBurst({ emoji, triggerKey }: FloatingEmojiBurstProps) {
  if (!triggerKey || !emoji) return null;

  const particles: ParticleProps[] = [
    { emoji, startX: -40, driftX: -25, delay: 0, scale: 1.1 },
    { emoji, startX: 0, driftX: 10, delay: 60, scale: 1.3 },
    { emoji, startX: 40, driftX: 30, delay: 120, scale: 0.95 },
    { emoji, startX: -20, driftX: -10, delay: 180, scale: 1.2 },
    { emoji, startX: 25, driftX: 15, delay: 240, scale: 1.0 },
  ];

  return (
    <View pointerEvents="none" style={styles.container} key={triggerKey}>
      {particles.map((p, index) => (
        <FloatingParticle key={`${triggerKey}-${index}`} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  particle: {
    position: 'absolute',
    bottom: 0,
  },
});
