import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);

  const [facing, setFacing] = useState('back'); 
  const [flash, setFlash] = useState('off');
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [isRecording, setIsRecording] = useState(false);
  
  const cameraRef = useRef(null);

  // Dynamic Strict Permission Request
  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');

      const galleryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  if (hasCameraPermission === null || hasAudioPermission === null || hasGalleryPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Permissions Load Ho Rhi Hain Bhai...</Text></View>;
  }

  if (!hasCameraPermission || !hasAudioPermission || !hasGalleryPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>App chalane ke liye Settings me jaakar Camera, Mic aur Gallery ki permission on karein.</Text>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1.0 });
        if (photo && photo.uri) {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          alert('Photo Gallery me save ho gayi! 📸');
        }
      } catch (error) {
        alert('Photo Error: ' + error.message);
      }
    }
  };

  const handleVideoRecording = async () => {
    if (cameraRef.current) {
      if (isRecording) {
        try {
          await cameraRef.current.stopRecording();
          setIsRecording(false);
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          setIsRecording(true);
          let qualitySetting = '1080p';
          if (videoQuality === '2160p') qualitySetting = '2160p'; // 4K Hardware Map
          if (videoQuality === '720p') qualitySetting = '720p';

          const video = await cameraRef.current.recordAsync({ quality: qualitySetting });
          if (video && video.uri) {
            await MediaLibrary.saveToLibraryAsync(video.uri);
            alert('Video Gallery me save ho gayi! 🎥');
          }
        } catch (error) {
          setIsRecording(false);
          alert('Video Error: ' + error.message);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        flash={flash}
        mode={isRecording ? 'video' : 'picture'}
        ref={cameraRef}
      >
        {/* Top Controls Bar */}
        <View style={styles.topBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.subButton} onPress={() => setVideoQuality(videoQuality === '1080p' ? '2160p' : videoQuality === '2160p' ? '720p' : '1080p')}>
              <Text style={styles.subButtonText}>RES: {videoQuality === '2160p' ? '4K' : videoQuality}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subButton} onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}>
              <Text style={styles.subButtonText}>FLASH: {flash.toUpperCase()}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Bottom Actions Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.sideButton} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
            <Text style={styles.buttonText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.innerCaptureButton} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.sideButton, isRecording && { backgroundColor: 'red' }]} onPress={handleVideoRecording}>
            <Text style={styles.buttonText}>{isRecording ? '⏹️' : '📹'}</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%', justifyContent: 'space-between' },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', padding: 20 },
  topBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: 50, paddingBottom: 10, paddingHorizontal: 10 },
  subButton: { backgroundColor: '#333', padding: 8, borderRadius: 5, marginRight: 10 },
  subButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingBottom: 40, paddingTop: 20 },
  sideButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 22 },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerCaptureButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' }
});
    
