import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface CircleButtonProps {
  onPress: () => void;
}

export default function CircleButton({ onPress }: CircleButtonProps) {
  return (
    <Pressable style={styles.circle} onPress={onPress}>
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#000',
    borderRadius: 50,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  plus: {
    fontSize: 36,
    color: '#fff',
    lineHeight: 40,
  },
});
