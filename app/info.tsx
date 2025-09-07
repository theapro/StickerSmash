import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

// Info Card Component
const InfoCard = ({
  icon,
  title,
  description,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.infoCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.infoCardIcon}>
        <Ionicons name={icon as any} size={24} color="#000000" />
      </View>
      <View style={styles.infoCardContent}>
        <Text style={styles.infoCardTitle}>{title}</Text>
        <Text style={styles.infoCardDescription}>{description}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />}
    </TouchableOpacity>
  );
};

export default function InfoScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Info</Text>
        <Text style={styles.headerSubtitle}>About StickerSmash</Text>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.appInfoContainer}>
            <View style={styles.appIcon}>
              <Ionicons name="camera" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>StickerSmash</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Transform your photos with fun stickers and creative editing
              tools. Make your memories more colorful and expressive.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <InfoCard
            icon="images-outline"
            title="Photo Selection"
            description="Choose photos from your gallery to edit"
          />
          <InfoCard
            icon="happy-outline"
            title="Sticker Collection"
            description="Add fun stickers and emojis to your photos"
          />
          <InfoCard
            icon="move-outline"
            title="Interactive Editing"
            description="Drag, resize, and position stickers with gestures"
          />
          <InfoCard
            icon="download-outline"
            title="Save & Share"
            description="Save your creations to your device gallery"
          />
        </View>

        {/* Credits */}
        <View style={styles.creditsSection}>
          <Text style={styles.creditsText}>
            made by thaynpro
          </Text>
          <Text style={styles.creditsSubtext}>
            © 2024 StickerSmash. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="dark" />
    </View>
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
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  appInfoContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  appVersion: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
  },
  creditsSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingBottom: 48,
  },
  creditsText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  creditsSubtext: {
    fontSize: 12,
    color: "#999999",
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
});
