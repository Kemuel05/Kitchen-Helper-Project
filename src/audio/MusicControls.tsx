import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useMusic } from "./MusicProvider";
import type { MusicTrackId } from "./music-tracks";

export function MusicControls() {
  const {
    tracks,
    selectedTrackId,
    selectedTrack,
    isMusicEnabled,
    isPlaying,
    isReady,
    selectTrack,
    toggleMusic,
  } = useMusic();

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggleMusic() {
    try {
      setIsUpdating(true);
      await toggleMusic();
    } catch (error) {
      console.error("Unable to toggle music:", error);

      Alert.alert(
        "Unable to update music",
        "Something went wrong while changing the music setting."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleSelectTrack(trackId: MusicTrackId) {
    if (trackId === selectedTrackId) {
      return;
    }

    try {
      setIsUpdating(true);
      await selectTrack(trackId);
    } catch (error) {
      console.error("Unable to select track:", error);

      Alert.alert(
        "Unable to change soundtrack",
        "Something went wrong while changing the soundtrack."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function getMusicStatus() {
    if (!isReady) {
      return "Loading music...";
    }

    if (!isMusicEnabled) {
      return "Music is off";
    }

    if (isPlaying) {
      return "Now playing";
    }

    return "Preparing soundtrack...";
  }

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.floatingButton,
          pressed && styles.pressedButton,
          !isReady && styles.disabledButton,
        ]}
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open music controls"
      >
        <Text style={styles.floatingButtonIcon}>
          {isMusicEnabled ? "♫" : "♪"}
        </Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setIsOpen(false)}
            accessibilityLabel="Close music controls"
          />

          <View style={styles.panel}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>
                  Food Valley Music
                </Text>

                <Text style={styles.status}>
                  {getMusicStatus()}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setIsOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close music controls"
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>
                  Background music
                </Text>

                <Text style={styles.toggleSubtitle}>
                  {isMusicEnabled
                    ? selectedTrack.title
                    : "Turn music on to play a soundtrack"}
                </Text>
              </View>

              {isUpdating ? (
                <ActivityIndicator
                  size="small"
                  color="#52734D"
                />
              ) : (
                <Switch
                  value={isMusicEnabled}
                  onValueChange={() => {
                    void handleToggleMusic();
                  }}
                  disabled={!isReady}
                  trackColor={{
                    false: "#D5D0C4",
                    true: "#A8BE96",
                  }}
                />
              )}
            </View>

            <Text style={styles.sectionTitle}>
              Choose a soundtrack
            </Text>

            <ScrollView
              style={styles.trackList}
              showsVerticalScrollIndicator={false}
            >
              {tracks.map((track) => {
                const isSelected =
                  track.id === selectedTrackId;

                return (
                  <Pressable
                    key={track.id}
                    style={({ pressed }) => [
                      styles.trackButton,
                      isSelected &&
                        styles.selectedTrackButton,
                      pressed &&
                        styles.pressedTrackButton,
                    ]}
                    onPress={() => {
                      void handleSelectTrack(track.id);
                    }}
                    disabled={isUpdating}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${track.title}`}
                  >
                    <View style={styles.trackInformation}>
                      <Text
                        style={[
                          styles.trackTitle,
                          isSelected &&
                            styles.selectedTrackTitle,
                        ]}
                      >
                        {track.title}
                      </Text>

                      {isSelected && (
                        <Text style={styles.selectedLabel}>
                          Selected
                        </Text>
                      )}
                    </View>

                    <Text style={styles.checkmark}>
                      {isSelected ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.helperText}>
              Your soundtrack and on/off preference are saved automatically.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    top: 60,
    right: 18,
    zIndex: 100,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8CFB8",
    borderRadius: 23,
    backgroundColor: "#FFFDF7",
  },

  floatingButtonIcon: {
    fontSize: 24,
    fontWeight: "700",
    color: "#52734D",
  },

  pressedButton: {
    opacity: 0.7,
  },

  disabledButton: {
    opacity: 0.6,
  },

  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    backgroundColor: "rgba(35, 39, 32, 0.45)",
  },

  panel: {
    width: "100%",
    maxHeight: "78%",
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#FFF8E7",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#52734D",
  },

  status: {
    marginTop: 5,
    fontSize: 14,
    color: "#77736A",
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: "#F0E8D5",
  },

  closeButtonText: {
    fontSize: 25,
    lineHeight: 27,
    color: "#665F52",
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DED5BE",
    borderRadius: 17,
    backgroundColor: "#FFFDF7",
  },

  toggleTextContainer: {
    flex: 1,
    marginRight: 14,
  },

  toggleTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3F4A3C",
  },

  toggleSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    color: "#77736A",
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#52734D",
  },

  trackList: {
    flexGrow: 0,
  },

  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#DED5BE",
    borderRadius: 15,
    backgroundColor: "#FFFDF7",
  },

  selectedTrackButton: {
    borderWidth: 2,
    borderColor: "#7A9E68",
    backgroundColor: "#E7EFD9",
  },

  pressedTrackButton: {
    opacity: 0.7,
  },

  trackInformation: {
    flex: 1,
  },

  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4943",
  },

  selectedTrackTitle: {
    color: "#3F5739",
  },

  selectedLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#52734D",
  },

  checkmark: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#52734D",
  },

  helperText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: "#77736A",
    textAlign: "center",
  },
});