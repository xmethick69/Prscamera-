import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, ScrollView } from 'react-native';
import { Camera, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(null);

  // Expo 51 safe constants (Using direct strings instead of Camera.Constants)
  const [facing, setFacing] = useState('back'); 
  const [flash, setFlash] = useState('off');
  const [exposure, setExposure] = useState(0);
  const [whiteBalance, setWhiteBalance] = useState('auto');
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [isRecording, setIsRecording] = useState(false);
  
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMicrophonePermission();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaStatus.status === 'granted');
    })();
  }, []);

  if (!cameraPermission || !microphonePermission || mediaLibraryPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Permissions Loading...</Text></View>;
  }

  if (!cameraPermission.granted || !microphonePermission.granted || !mediaLibraryPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>App ko chalne ke liye Camera, Audio aur Gallery ki permission chahiye.</Text>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 1.0, skipProcessing: false, exif: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        alert('Photo Gallery me save ho gayi! 📸');
      } catch (error) {
        alert('Photo Error: ' + error.message);
      }
    }
  };

  const handleVideoRecording = async () => {
    if (cameraRef.current) {
      if (isRecording) {
        cameraRef.current.stopRecording();
        setIsRecording(false);
      } else {
        try {
          setIsRecording(true);
          // Expo 51 safe video quality mapping
          let qualityOption = '1080p';
          if (videoQuality === '2160p') qualityOption = '2160p';
          if (videoQuality === '720p') qualityOption = '720p';

          const videoOptions = { quality: qualityOption };
          const video = await cameraRef.current.recordAsync(videoOptions);
          await MediaLibrary.saveToLibraryAsync(video.uri);
          alert('Video Gallery me save ho gayi! 🎥');
        } catch (error) {
          setIsRecording(false);
          alert('Video Error: ' + error.message);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        facing={facing}
        flash={flash}
        exposure={exposure}
        whiteBalance={whiteBalance}
        ref={cameraRef}
      >
        {/* Top Controls Bar */}
        <View style={styles.topBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.subButton} onPress={() => setVideoQuality(videoQuality === '1080p' ? '2160p' : videoQuality === '2160p' ? '720p' : '1080p')}>
              <Text style={styles.subButtonText}>RES: {videoQuality === '2160p' ? '4K' : videoQuality}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subButton} onPress={() => setWhiteBalance(whiteBalance === 'auto' ? 'sunny' : whiteBalance === 'sunny' ? 'cloudy' : 'auto')}>
              <Text style={styles.subButtonText}>WB: {whiteBalance.toUpperCase()}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subButton} onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}>
              <Text style={styles.subButtonText}>FLASH: {flash.toUpperCase()}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Exposure Slider (Vertical Look) */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderText}>EV</Text>
          <Slider
            style={{ width: 150, height: 40 }}
            minimumValue={-1}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#555555"
            value={exposure}
            onValueChange={(val) => setExposure(val)}
          />
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
      </Camera>
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
  sliderContainer: { position: 'absolute', right: -40, top: '45%', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20, transform: [{ rotate: '-90deg' }] },
  sliderText: { color: '#fff', fontWeight: 'bold', marginBottom: 5, transform: [{ rotate: '90deg' }] },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingBottom: 40, paddingTop: 20 },
  sideButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 22 },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerCaptureButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' }
});
      
