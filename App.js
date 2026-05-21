import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [flash, setFlash] = useState('off');
  const [exposure, setExposure] = useState(0);
  
  const cameraRef = useRef(null);
  const device = useCameraDevice('back'); // Active back camera

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermission();
      const microphoneStatus = await Camera.requestMicrophonePermission();
      const galleryStatus = await MediaLibrary.requestPermissionsAsync();
      
      setHasPermission(
        cameraStatus === 'granted' && 
        microphoneStatus === 'granted' && 
        galleryStatus.status === 'granted'
      );
    })();
  }, []);

  if (!hasPermission) {
    return <View style={styles.container}><Text style={styles.text}>Permissions Loading or Denied...</Text></View>;
  }

  if (!device) {
    return <View style={styles.container}><Text style={styles.text}>Camera Device Nahi Mila Bhai!</Text></View>;
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: flash,
          enableShutterSound: true
        });
        await MediaLibrary.saveToLibraryAsync(photo.path);
        alert('Photo Gallery me save ho gayi! 📸');
      } catch (error) {
        alert('Photo Error: ' + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo={true}
        video={true}
        exposure={exposure}
      />

      {/* Overlays and Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.subButton} onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}>
          <Text style={styles.subButtonText}>FLASH: {flash.toUpperCase()}</Text>
        </TouchableOpacity>
        <Text style={styles.subButtonText}>MODE: 4K/1080p AUTO</Text>
      </View>

      {/* Exposure Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>EV</Text>
        <Slider
          style={{ width: 130, height: 40 }}
          minimumValue={-2}
          maximumValue={2}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#555555"
          value={exposure}
          onValueChange={(val) => setExposure(val)}
        />
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.innerCaptureButton} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 100 },
  topBar: { position: 'absolute', top: 50, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8 },
  subButton: { backgroundColor: '#333', padding: 5, borderRadius: 5 },
  subButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  sliderContainer: { position: 'absolute', right: -35, top: '45%', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 20, transform: [{ rotate: '-90deg' }] },
  sliderText: { color: '#fff', fontWeight: 'bold', transform: [{ rotate: '90deg' }], marginBottom: 5 },
  bottomBar: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerCaptureButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' }
});
