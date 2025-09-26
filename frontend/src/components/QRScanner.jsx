import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);
      setIsProcessing(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start continuous QR scanning
        videoRef.current.onloadedmetadata = () => {
          startQRScanning();
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    // Clear scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setIsProcessing(false);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return null;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg');
  };

  const startQRScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        scanQRCode();
      }
    }, 100); // Scan every 100ms
  };

  const scanQRCode = () => {
    if (isProcessing) return; // Prevent multiple simultaneous scans
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      setIsProcessing(true);
      console.log('QR Code detected:', code.data);
      
      // Call the onScan callback with the detected QR data
      onScan(code.data);
      
      // Stop scanning after successful detection
      stopCamera();
    }
  };

  const handleScanClick = () => {
    if (isScanning && !isProcessing) {
      scanQRCode();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Scan QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-gray-900 aspect-square">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* QR Code Frame */}
              <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              </div>
              
              {/* Scanning Line Animation */}
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white text-sm bg-black bg-opacity-50 rounded-lg px-3 py-2">
              {isScanning ? 'Position the QR code within the frame' : 'Camera ready - scanning will start automatically'}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200">
          {error ? (
            <button
              onClick={startCamera}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          ) : (
            <button
              onClick={handleScanClick}
              disabled={!isScanning || isProcessing}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Start Scanning
                </>
              )}
            </button>
          )}
        </div>

        {/* Hidden Canvas for QR Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default QRScanner;
