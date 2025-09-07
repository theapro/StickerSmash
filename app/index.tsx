import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";

import EmojiPicker from "../components/EmojiPicker";
import ImageViewer from "../components/ImageViewer";

interface StickerData {
  id: string;
  uri: string;
  pan: Animated.ValueXY;
  scale: Animated.Value;
  sizeMode: number; // 0 = small, 1 = medium, 2 = large
}

// Modern Button Component
const ModernButton = ({
  onPress,
  children,
  style,
  variant = "primary",
  icon,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  variant?: "primary" | "secondary" | "ghost";
  icon?: string;
}) => {
  const buttonStyles = [
    styles.modernButton,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "ghost" && styles.ghostButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    variant === "primary" && styles.primaryButtonText,
    variant === "secondary" && styles.secondaryButtonText,
    variant === "ghost" && styles.ghostButtonText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={18}
            color={
              variant === "primary"
                ? "#FFFFFF"
                : variant === "secondary"
                ? "#000000"
                : "#666666"
            }
            style={styles.buttonIcon}
          />
        )}
        <Text style={textStyles}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const imageRef = useRef<View>(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stickers, setStickers] = useState<StickerData[]>([]);

  React.useEffect(() => {
    if (status === null) {
      requestPermission();
    }
  }, [status, requestPermission]);

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

  const onEmojiSelect = useCallback((emoji: string) => {
    const newSticker: StickerData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      uri: emoji,
      pan: new Animated.ValueXY({ x: 0, y: 0 }),
      scale: new Animated.Value(1.2),
      sizeMode: 0,
    };

    setStickers((prev) => [...prev, newSticker]);
    setIsModalVisible(false);
  }, []);

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
        format: "png",
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert("Success", "Image saved to gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image. Please try again.");
    }
  }, []);

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
        const newScale = Math.max(0.5, Math.min(3, event.nativeEvent.scale));
        sticker.scale.setValue(newScale);
      }
    };

    const onDoubleTap = () => {
      const sizes = [1.2, 1.5, 2.0];
      sticker.sizeMode = (sticker.sizeMode + 1) % sizes.length;
      const targetSize = sizes[sticker.sizeMode];

      Animated.spring(sticker.scale, {
        toValue: targetSize,
        tension: 150,
        friction: 8,
        useNativeDriver: false,
      }).start();
    };

    return {
      onPanGestureEvent,
      onPanHandlerStateChange,
      onPinchGestureEvent,
      onPinchHandlerStateChange,
      onDoubleTap,
    };
  }, []);

  const renderSticker = useCallback(
    (sticker: StickerData, index: number) => {
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
              <Animated.View style={{ flex: 1 }}>
                <TapGestureHandler
                  numberOfTaps={2}
                  onActivated={handlers.onDoubleTap}
                >
                  <Animated.View
                    style={[
                      styles.sticker,
                      {
                        bottom: 20 + index * 10,
                        right: 20 + index * 10,
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
                </TapGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      );
    },
    [createStickerGestureHandlers]
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StickerSmash</Text>
        <Text style={styles.headerSubtitle}>Transform your photos</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.imageContainer}>
          <View ref={imageRef} collapsable={false} style={styles.imageWrapper}>
            <ImageViewer selectedImage={selectedImage} />
            {stickers.map((sticker, index) => renderSticker(sticker, index))}
          </View>
        </View>

        {/* Action Buttons */}
        {showAppOptions ? (
          <View style={styles.actionsContainer}>
            <ModernButton
              onPress={onAddSticker}
              variant="primary"
              icon="happy-outline"
              style={styles.primaryAction}
            >
              Add Sticker
            </ModernButton>

            <View style={styles.secondaryActions}>
              <ModernButton
                onPress={onReset}
                variant="ghost"
                icon="refresh-outline"
                style={styles.secondaryAction}
              >
                Reset
              </ModernButton>
              <ModernButton
                onPress={onSaveImageAsync}
                variant="secondary"
                icon="download-outline"
                style={styles.secondaryAction}
              >
                Save
              </ModernButton>
            </View>
          </View>
        ) : (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeContent}>
              <Ionicons
                name="images-outline"
                size={40}
                color="#CCCCCC"
                style={styles.welcomeIcon}
              />
              <Text style={styles.welcomeTitle}>Choose Your Photo</Text>
              <Text style={styles.welcomeText}>
                Select a photo from your gallery to get started
              </Text>
              <ModernButton
                onPress={pickImageAsync}
                variant="primary"
                icon="camera-outline"
                style={styles.choosePhotoButton}
              >
                Choose Photo
              </ModernButton>
            </View>
          </View>
        )}
      </View>

      <EmojiPicker
        isVisible={isModalVisible}
        onClose={onModalClose}
        onSelect={onEmojiSelect}
      />
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: "#000000",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 40,
  },
  welcomeContent: {
    alignItems: "center",
  },
  welcomeIcon: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "300",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  choosePhotoButton: {
    minWidth: 160,
  },
  actionsContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 20,
  },
  primaryAction: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
  },
  modernButton: {
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: "#000000",
  },
  secondaryButton: {
    backgroundColor: "#F0F0F0",
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#000000",
  },
  ghostButtonText: {
    color: "#666666",
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
