import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [exposure, setExposure] = useState(0); // Exposure Setting
  const [whiteBalance, setWhiteBalance] = useState('auto'); // Temperature Setting
  const [videoQuality, setVideoQuality] = useState('1080p'); // 4K, 1080p, 720p
  const [isRecording, setIsRecording] = useState(false);
  
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(cameraStatus.status === 'granted' && audioStatus.status === 'granted');
    })();
  }, []);

  if (hasPermission === null) return <View style={styles.container}><Text style={styles.text}>Requesting Permissions...</Text></View>;
  if (hasPermission === false) return <View style={styles.container}><Text style={styles.text}>No access to camera</Text></View>;

  // Perfect Photo Capture Function (Fixes Black Screen)
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 1.0, skipProcessing: false, exif: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        alert('Photo Saved to Gallery! 📸');
      } catch (error) {
        alert('Capture Error: ' + error.message);
      }
    }
  };

  // Video Recording Function with Custom Quality
  const handleVideoRecording = async () => {
    if (cameraRef.current) {
      if (isRecording) {
        cameraRef.current.stopRecording();
        setIsRecording(false);
      } else {
        try {
          setIsRecording(true);
          let qualityOption = Camera.Constants.VideoQuality['1080p'];
          if (videoQuality === '2160p') qualityOption = Camera.Constants.VideoQuality['2160p']; // 4K
          if (videoQuality === '720p') qualityOption = Camera.Constants.VideoQuality['720p'];

          const videoOptions = { quality: qualityOption };
          const video = await cameraRef.current.recordAsync(videoOptions);
          await MediaLibrary.saveToLibraryAsync(video.uri);
          alert('Video Saved to Gallery! 🎥');
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
        type={cameraType}
        flashMode={flashMode}
        exposure={exposure}
        whiteBalance={whiteBalance}
        ref={cameraRef}
      >
        {/* Top Controls Bar */}
        <View style={styles.topBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Resolution Toggle */}
            <TouchableOpacity style={styles.subButton} onPress={() => setVideoQuality(videoQuality === '1080p' ? '2160p' : videoQuality === '2160p' ? '720p' : '1080p')}>
              <Text style={styles.subButtonText}>RES: {videoQuality === '2160p' ? '4K' : videoQuality}</Text>
            </TouchableOpacity>

            {/* WB / Temperature Toggle */}
            <TouchableOpacity style={styles.subButton} onPress={() => setWhiteBalance(whiteBalance === 'auto' ? 'sunny' : whiteBalance === 'sunny' ? 'cloudy' : 'auto')}>
              <Text style={styles.subButtonText}>WB: {whiteBalance.toUpperCase()}</Text>
            </TouchableOpacity>

            {/* Flash Toggle */}
            <TouchableOpacity style={styles.subButton} onPress={() => setFlashMode(flashMode === Camera.Constants.FlashMode.off ? Camera.Constants.FlashMode.on : Camera.Constants.FlashMode.off)}>
              <Text style={styles.subButtonText}>FLASH: {flashMode === Camera.Constants.FlashMode.on ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Exposure Slider Center Right */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderText}>EV</Text>
          <Slider
            style={{ width: 150, height: 40 }}
            minimumValue={-1}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            value={exposure}
            onValueChange={(val) => setExposure(val)}
          />
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.sideButton} onPress={() => setCameraType(cameraType === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back)}>
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
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, justifyContent: 'space-between' },
  text: { color: '#fff', fontSize: 18, textAlign: 'center', marginTop: '50%' },
  topBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: 40, paddingBottom: 10, paddingHorizontal: 10 },
  subButton: { backgroundColor: '#333', padding: 8, borderRadius: 5, marginRight: 10 },
  subButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  sliderContainer: { position: 'absolute', right: 10, top: '40%', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20, transform: [{ rotate: '-90deg' }] },
  sliderText: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingBottom: 30, paddingTop: 20 },
  sideButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 22 },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerCaptureButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' }
});
          
