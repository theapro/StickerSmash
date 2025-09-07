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
  Text,
  TouchableOpacity,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";
import { Ionicons } from "@expo/vector-icons";

import ImageViewer from "../components/ImageViewer";
import EmojiPicker from "../components/EmojiPicker";

interface StickerData {
  id: string;
  uri: string;
  pan: Animated.ValueXY;
  scale: Animated.Value;
}

// Modern Button Component
const ModernButton = ({ 
  onPress, 
  children, 
  style, 
  variant = "primary",
  icon 
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
    <TouchableOpacity style={buttonStyles} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.buttonContent}>
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={
              variant === "primary" ? "#FFFFFF" :
              variant === "secondary" ? "#6366F1" : "#6B7280"
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
      scale: new Animated.Value(1),
    };

    setStickers(prev => [...prev, newSticker]);
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
        format: 'png',
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
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    );
  }, [createStickerGestureHandlers]);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Photo Studio</Text>
        <Text style={styles.headerSubtitle}>Add stickers to your photos</Text>
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
              <Ionicons name="images-outline" size={48} color="#9CA3AF" style={styles.welcomeIcon} />
              <Text style={styles.welcomeTitle}>Choose Your Photo</Text>
              <Text style={styles.welcomeText}>Select a photo from your gallery to get started</Text>
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "400",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  welcomeContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeContent: {
    alignItems: "center",
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  choosePhotoButton: {
    minWidth: 180,
  },
  actionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryAction: {
    marginBottom: 16,
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
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#6366F1",
  },
  ghostButtonText: {
    color: "#6B7280",
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