import React from 'react';
import { FlatList, Image, Pressable, StyleSheet } from 'react-native';

interface EmojiListProps {
  onSelect: (emoji: string) => void;
}

const emojis = [
  require('../assets/stickers/heart.png'),
  require('../assets/stickers/star.png'),
  require('../assets/stickers/unicorn.png'),
];

export default function EmojiList({ onSelect }: EmojiListProps) {
  return (
    <FlatList
      horizontal
      data={emojis}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(Image.resolveAssetSource(item).uri)}>
          <Image source={item} style={styles.image} />
        </Pressable>
      )}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 10,
    flexDirection: 'row',
  },
  image: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
  },
});
