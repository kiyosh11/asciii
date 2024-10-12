import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles/AsciiMaker.module.css';

const AsciiMaker = () => {
  const canvasRef = useRef(null);
  const [ascii, setAscii] = useState('');
  const [fontSize, setFontSize] = useState(10);

  const grayRamp = ' ,.'; 

  const toGrayScale = (r, g, b) => Math.round(0.299 * r + 0.587 * g + 0.114 * b);

  const getCharacterForGrayScale = (grayScale) => {
    const index = Math.floor(grayScale / 86); 
    return grayRamp[index];
  };

  const convertToAscii = (imageData, width, height) => {
    let asciiImage = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const r = imageData.data[offset];
        const g = imageData.data[offset + 1];
        const b = imageData.data[offset + 2];
        const grayScale = toGrayScale(r, g, b);
        asciiImage += getCharacterForGrayScale(grayScale);
      }
      asciiImage += '\n';
    }
    return asciiImage;
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const scaleFactor = Math.min(400 / img.width, 200 / img.height);
        const width = Math.floor(img.width * scaleFactor);
        const height = Math.floor(img.height * scaleFactor);

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const asciiArt = convertToAscii(imageData, width, height);
        setAscii(asciiArt);

        const fontSize = Math.max(5, Math.min(10, 800 / width));
        setFontSize(fontSize);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const downloadAsciiArtAsText = () => {
    const blob = new Blob([ascii], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii_art.txt';
    a.click();
    URL.revokeObjectURL(url); 
  };

  const downloadAsciiArtAsPNG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const lines = ascii.split('\n');
    const lineHeight = fontSize; 

    canvas.width = Math.max(...lines.map(line => line.length * fontSize * 0.6)); 
    canvas.height = lines.length * lineHeight;

    ctx.fillStyle = 'black'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white'; 
    ctx.font = `${fontSize}px monospace`; 
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, lineHeight * (index + 1));
    });

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ascii_art.png';
      a.click();
      URL.revokeObjectURL(url); 
    }, 'image/png');
  };

  useEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector(`.${styles.asciiOutput}`)?.offsetWidth || 800;
      const newFontSize = Math.max(5, Math.min(10, containerWidth / 100));
      setFontSize(newFontSize);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.asciiMaker}>
      <input type="file" onChange={handleFileInput} accept="image/*" />
      <button onClick={downloadAsciiArtAsText} disabled={!ascii}>
        Download ASCII Art (Text)
      </button>
      <button onClick={downloadAsciiArtAsPNG} disabled={!ascii}>
        Download ASCII Art (PNG)
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <pre
        className={styles.asciiOutput}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`
        }}
      >
        {ascii}
      </pre>
    </div>
  );
};

export default AsciiMaker;
