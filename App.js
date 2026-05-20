import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, PanResponder, Animated, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [libraryPermission, requestLibraryPermission] = MediaLibrary.usePermissions();
  const [stickers, setStickers] = useState([]);
  const viewToSnapshotRef = useRef();

  // 1. Check Hardware & Storage Permissions
  if (!permission || !libraryPermission) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.statusText}>System checking hardware configurations...</Text>
      </View>
    );
  }

  // Permissions prompt if not granted
  if (!permission.granted || !libraryPermission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.warningText}>
          Bhai, prscamera chalane ke liye Camera aur Gallery Storage access zaroori hai!
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={() => { requestPermission(); requestLibraryPermission(); }}>
          <Text style={styles.btnText}>Allow Settings Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Spawn New Sticker on Screen
  const injectStickerToView = (emojiSymbol) => {
    const newStickerNode = {
      id: Date.now(),
      emoji: emojiSymbol,
      pan: new Animated.ValueXY({ x: SCREEN_WIDTH / 2 - 30, y: SCREEN_HEIGHT / 3 }),
    };
    setStickers([...stickers, newStickerNode]);
  };

  // 3. CORE PROCESSING ENGINE (Merge & Save)
  const captureAndMergeLayers = async () => {
    try {
      const resultLocalUri = await captureRef(viewToSnapshotRef, {
        format: 'png',
        quality: 1.0,
      });

      await MediaLibrary.saveToLibraryAsync(resultLocalUri);
      alert('🎉 Superb! Photo stickers ke sath aapki asli phone gallery mein save ho chuki hai.');
      setStickers([]); 
    } catch (captureError) {
      console.error(captureError);
      alert('Photo save karne mein dikkat aayi.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      
      {/* Target Workspace for Snapshot */}
      <View style={styles.captureWorkspace} ref={viewToSnapshotRef} collapsable={false}>
        
        {/* Live Camera Stream Viewport */}
        <CameraView style={StyleSheet.absoluteFillObject} facing="user">
          
          {/* Draggable Stickers Overlay */}
          {stickers.map((sticker) => {
            
            const panResponderEngine = PanResponder.create({
              onStartShouldSetPanResponder: () => true,
              onPanResponderMove: Animated.event(
                [null, { dx: sticker.pan.x, dy: sticker.pan.y }],
                { useNativeDriver: false }
              ),
              onPanResponderRelease: () => {
                sticker.pan.extractOffset(); // Lock position after touch release
              },
            });

            return (
              <Animated.View
                key={sticker.id}
                style={[sticker.pan.getLayout(), styles.draggableStickerWrapper]}
                {...panResponderEngine.panHandlers}
              >
                <Text style={styles.stickerEmojiFont}>{sticker.emoji}</Text>
              </Animated.View>
            );
          })}
          
        </CameraView>
      </View>

      {/* Bottom Control Station Panel */}
      <View style={styles.controlDashboard}>
        <Text style={styles.panelTitleText}>Tap to Place Cute Stickers:</Text>
        
        {/* Stickers Carousel Tray */}
        <View style={styles.stickersCarousel}>
          {['💖', '🎀', '🧸', '🐱', '✨', '👑', '🦄'].map((emoji) => (
            <TouchableOpacity 
              key={emoji} 
              style={styles.stickerThumbBtn} 
              onPress={() => injectStickerToView(emoji)}
            >
              <Text style={styles.thumbEmojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shutter Click Button */}
        <TouchableOpacity style={styles.shutterButtonOuter} onPress={captureAndMergeLayers}>
          <View style={styles.shutterButtonInner} />
        </TouchableOpacity>
        
        <Text style={styles.statusIndicatorLabel}>🟢 prscamera system active</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#000' },
  centeredContainer: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', padding: 30 },
  statusText: { color: '#ff69b4', fontSize: 14, fontWeight: '600' },
  warningText: { color: '#fff', textAlign: 'center', fontSize: 15, marginBottom: 25, lineHeight: 22 },
  permissionBtn: { backgroundColor: '#ff69b4', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  
  captureWorkspace: { flex: 1, width: '100%', overflow: 'hidden' },
  draggableStickerWrapper: { position: 'absolute', padding: 8, zIndex: 999 },
  stickerEmojiFont: { fontSize: 55, textAlign: 'center' },
  
  controlDashboard: { backgroundColor: '#0d0d0d', paddingVertical: 20, alignItems: 'center', borderTopWidth: 1, borderColor: '#222' },
  panelTitleText: { color: '#ff69b4', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  stickersCarousel: { flexDirection: 'row', gap: 10, marginBottom: 22, paddingHorizontal: 15 },
  stickerThumbBtn: { backgroundColor: '#1c1c1e', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2c2c2e' },
  thumbEmojiText: { fontSize: 22 },
  
  shutterButtonOuter: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  shutterButtonInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#ff69b4' },
  statusIndicatorLabel: { color: '#555', fontSize: 10, letterSpacing: 0.5, marginTop: 5 }
});
