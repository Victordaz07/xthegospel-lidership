/**
 * QRScanner - Scan member QR codes
 * 
 * Allows leaders to scan QR codes from members to look up their profiles.
 * Uses the device camera when available.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaKeyboard, FaXmark, FaClipboard, FaSpinner } from 'react-icons/fa6';
import { parseProfileQRData, readXtgIdFromClipboard } from '../../utils/appBridge';
import './QRScanner.css';

interface QRScannerProps {
  onScan: (xthegospelId: string, displayName?: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps): JSX.Element {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setScanning(true);
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setMode('camera');
      setScanning(false);
      
      // Note: For actual QR scanning, you'd integrate a library like
      // 'jsQR' or '@aspect/barcode-scanner' here
      // For now, we'll use manual input as the primary method
      
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Permiso de cámara denegado' 
          : 'No se pudo acceder a la cámara'
      );
      setMode('manual');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    
    const parsed = parseProfileQRData(manualInput.trim());
    
    if (parsed) {
      onScan(parsed.xthegospelId, parsed.displayName);
    } else {
      setError('ID no válido. Formato esperado: XTG-2026-ABC123');
    }
  };

  const handlePaste = async () => {
    const id = await readXtgIdFromClipboard();
    if (id) {
      setManualInput(id);
      onScan(id);
    } else {
      setError('No se encontró un ID válido en el portapapeles');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  return (
    <div className="qr-scanner">
      <div className="qr-scanner__header">
        <h2 className="qr-scanner__title">Escanear Miembro</h2>
        {onClose && (
          <button className="qr-scanner__close" onClick={onClose}>
            <FaXmark />
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="qr-scanner__tabs">
        <button
          className={`qr-scanner__tab ${mode === 'manual' ? 'qr-scanner__tab--active' : ''}`}
          onClick={() => { stopCamera(); setMode('manual'); }}
        >
          <FaKeyboard />
          Ingresar ID
        </button>
        <button
          className={`qr-scanner__tab ${mode === 'camera' ? 'qr-scanner__tab--active' : ''}`}
          onClick={startCamera}
          disabled={scanning}
        >
          {scanning ? <FaSpinner className="qr-scanner__spinner" /> : <FaCamera />}
          Escanear QR
        </button>
      </div>

      {/* Error Display */}
      {(error || cameraError) && (
        <div className="qr-scanner__error">
          {error || cameraError}
        </div>
      )}

      {/* Manual Input Mode */}
      {mode === 'manual' && (
        <div className="qr-scanner__manual">
          <p className="qr-scanner__instruction">
            Ingresa el xTheGospel ID del miembro o pega desde el portapapeles
          </p>
          
          <div className="qr-scanner__input-group">
            <input
              type="text"
              className="qr-scanner__input"
              placeholder="XTG-2026-ABC123"
              value={manualInput}
              onChange={(e) => { setManualInput(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="qr-scanner__paste-btn"
              onClick={handlePaste}
              title="Pegar del portapapeles"
            >
              <FaClipboard />
            </button>
          </div>
          
          <button 
            className="qr-scanner__submit"
            onClick={handleManualSubmit}
            disabled={!manualInput.trim()}
          >
            Buscar Miembro
          </button>
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="qr-scanner__camera">
          <div className="qr-scanner__video-container">
            <video 
              ref={videoRef} 
              className="qr-scanner__video"
              playsInline
              muted
            />
            <div className="qr-scanner__overlay">
              <div className="qr-scanner__frame" />
            </div>
          </div>
          <p className="qr-scanner__camera-hint">
            Apunta la cámara al código QR del miembro
          </p>
          
          {/* Fallback input while camera is active */}
          <div className="qr-scanner__camera-fallback">
            <span>¿No funciona? </span>
            <button onClick={() => { stopCamera(); setMode('manual'); }}>
              Ingresar manualmente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
