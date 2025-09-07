import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState, useCallback } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";

import Button from "../components/Button";
import CircleButton from "../components/CircleButton";
import EmojiPicker from "../components/EmojiPicker";
import ImageViewer from "../components/ImageViewer";

// Types for better type safety
interface StickerData {
  id: string;
  uri: string;
  pan: Animated.ValueXY;
  scale: Animated.Value;
}

export default function HomeScreen() {
  const imageRef = useRef<View>(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stickers, setStickers] = useState<StickerData[]>([]);

  // Request permissions on mount
  React.useEffect(() => {
    if (status === null) {
      requestPermission();
    }
  }, [status, requestPermission]);

  // Pick image from gallery with better error handling
  const pickImageAsync = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowAppOptions(true);
      } else {
        Alert.alert("No image selected", "You did not select any image.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, []);

  // Reset all state
  const onReset = useCallback(() => {
    setShowAppOptions(false);
    setSelectedImage(null);
    setStickers([]);
  }, []);

  const onAddSticker = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const onModalClose = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // Add sticker with unique ID for better management
  const onEmojiSelect = useCallback((emoji: string) => {
    const newSticker: StickerData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      uri: emoji,
      pan: new Animated.ValueXY({ x: 0, y: 0 }),
      scale: new Animated.Value(1),
    };
    
    setStickers(prev => [...prev, newSticker]);
    setIsModalVisible(false);
  }, []);

  // Save image to device storage with better error handling
  const onSaveImageAsync = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not supported", "Saving is not supported on web.");
      return;
    }

    if (!imageRef.current) {
      Alert.alert("Error", "No image to save.");
      return;
    }

    try {
      const localUri = await captureRef(imageRef, {
        height: 440,
        quality: 1,
        format: 'png',
      });
      
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert("Success", "Image saved to gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image. Please try again.");
    }
  }, []);

  // Create gesture handlers for each sticker
  const createStickerGestureHandlers = useCallback((sticker: StickerData) => {
    const onPanGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: sticker.pan.x,
            translationY: sticker.pan.y,
          },
        },
      ],
      { useNativeDriver: false }
    );

    const onPanHandlerStateChange = (event: any) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        sticker.pan.extractOffset();
        sticker.pan.setValue({ x: 0, y: 0 });
      }
    };

    const onPinchGestureEvent = Animated.event(
      [
        {
          nativeEvent: { scale: sticker.scale },
        },
      ],
      { useNativeDriver: false }
    );

    const onPinchHandlerStateChange = (event: any) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        sticker.scale.setValue(event.nativeEvent.scale);
      }
    };

    return {
      onPanGestureEvent,
      onPanHandlerStateChange,
      onPinchGestureEvent,
      onPinchHandlerStateChange,
    };
  }, []);

  // Render individual sticker component
  const renderSticker = useCallback((sticker: StickerData, index: number) => {
    const handlers = createStickerGestureHandlers(sticker);
    
    return (
      <PinchGestureHandler
        key={sticker.id}
        onGestureEvent={handlers.onPinchGestureEvent}
        onHandlerStateChange={handlers.onPinchHandlerStateChange}
      >
        <Animated.View style={{ flex: 1 }}>
          <PanGestureHandler
            onGestureEvent={handlers.onPanGestureEvent}
            onHandlerStateChange={handlers.onPanHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.sticker,
                {
                  bottom: 20 + (index * 10), // Offset multiple stickers
                  right: 20 + (index * 10),
                  transform: [
                    ...sticker.pan.getTranslateTransform(),
                    { scale: sticker.scale },
                  ],
                },
              ]}
            >
              <Image
                source={{ uri: sticker.uri }}
                style={styles.stickerImage}
                resizeMode="contain"
              />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    );
  }, [createStickerGestureHandlers]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer selectedImage={selectedImage} />
          {stickers.map((sticker, index) => renderSticker(sticker, index))}
        </View>
      </View>

      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <Button label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <Button label="Save" onPress={onSaveImageAsync} />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button label="Choose a photo" onPress={pickImageAsync} />
          <Button
            label="Use this photo"
            onPress={() => setShowAppOptions(true)}
          />
        </View>
      )}

      <EmojiPicker
        isVisible={isModalVisible}
        onClose={onModalClose}
        onSelect={onEmojiSelect}
      />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7FCFF7",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  sticker: {
    position: "absolute",
    width: 100,
    height: 100,
    zIndex: 10,
  },
  stickerImage: {
    width: "100%",
    height: "100%",
  },
});