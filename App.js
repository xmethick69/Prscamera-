// 1. Camera Settings state mein ye variables add karo:
const [pictureSize, setPictureSize] = useState('1920x1080'); // Resolution ke liye
const [fps, setFps] = useState(30); // FPS control
const [exposure, setExposure] = useState(0); // Exposure settings (-1 se 1)
const [whiteBalance, setWhiteBalance] = useState('auto'); // Temperature (Sunny, Cloudy, etc.)

// 2. Capture function ko advanced banao taaki Black photo na aaye:
const takePicture = async () => {
  if (cameraRef.current) {
    const options = { 
      quality: 1.0, 
      skipProcessing: false, // Ise false rakhein taaki object process ho
      exif: true 
    };
    const data = await cameraRef.current.takePictureAsync(options);
    console.log(data.uri); // Yeh tumhari perfect photo save karega
  }
};

// 3. Video Recording config 4K/1080p ke liye:
const recordVideo = async () => {
  if (cameraRef.current) {
    const videoOptions = {
      quality: '2160p', // 4K ke liye (Agar device support kare) ya '1080p'
      maxDuration: 60,
      fps: fps // Jo fps user select karega (30 ya 60)
    };
    const video = await cameraRef.current.recordAsync(videoOptions);
  }
};
