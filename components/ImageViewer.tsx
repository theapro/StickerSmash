import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface ImageViewerProps {
  selectedImage: string | null;
}

export default function ImageViewer({ selectedImage }: ImageViewerProps) {
  const imageSource = selectedImage
    ? { uri: selectedImage }
    : require('../assets/images/background.png'); // default image
  return <Image source={imageSource} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
