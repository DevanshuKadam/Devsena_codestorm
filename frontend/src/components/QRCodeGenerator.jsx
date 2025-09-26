import React, { useState } from 'react';
import { QrCode, Download, Copy, Clock, X, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

const QRCodeGenerator = ({ isOpen, onClose, ownerId, shopId, shopName }) => {
  const [qrData, setQrData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);

  const generateQR = async () => {
    if (!ownerId || !shopId) {
      setError('Owner ID and Shop ID are required');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const response = await apiService.generatePunchInQR(ownerId, shopId);
      
      if (response.success) {
        setQrData({
          qrCode: response.qrCode,
          token: response.token,
          expiresAt: response.expiresAt,
          shopName: response.shopName
        });
        setExpiresAt(new Date(response.expiresAt));
      } else {
        setError(response.message || 'Failed to generate QR code');
      }
    } catch (err) {
      console.error('QR generation error:', err);
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrData?.qrCode) return;

    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `punch-in-qr-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToken = () => {
    if (!qrData?.token) return;
    
    navigator.clipboard.writeText(qrData.token).then(() => {
      // You could add a toast notification here
      console.log('Token copied to clipboard');
    });
  };

  const formatTimeRemaining = () => {
    if (!expiresAt) return '';
    
    const now = new Date();
    const diff = expiresAt - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Generate Punch-In QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!qrData ? (
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-xl mb-6">
                <p className="text-sm text-blue-700">
                  Generate a QR code that employees can scan to punch in. The code will be valid for 24 hours.
                </p>
              </div>
              
              <button
                onClick={generateQR}
                disabled={isGenerating}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Generate QR Code
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
                  <img 
                    src={qrData.qrCode} 
                    alt="Punch-in QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Employees can scan this QR code to punch in
                </p>
              </div>

              {/* QR Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Valid for:</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatTimeRemaining()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Expires: {expiresAt?.toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={downloadQR}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={copyToken}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Token
                </button>
              </div>

              {/* Generate New */}
              <button
                onClick={() => {
                  setQrData(null);
                  setExpiresAt(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New QR Code
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
