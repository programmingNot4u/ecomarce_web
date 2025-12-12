
import { useState, type MouseEvent } from 'react';

interface ImageMagnifierProps {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
  className?: string;
  onClick?: () => void;
  watermarkSrc?: string;
}

export default function ImageMagnifier({
  src,
  alt = '',
  // Default sizing purely for the container if not handled by CSS
  width, 
  height,
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.5,
  className = '',
  onClick,
  watermarkSrc
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [xy, setXY] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const handleMouseEnter = (e: MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setImgSize({ width, height });
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { top, left, width, height } = elem.getBoundingClientRect();
    
    // Calculate cursor position relative to the image
    let x = e.pageX - left - window.scrollX;
    let y = e.pageY - top - window.scrollY;

    // Prevent magnifier from going outside the image boundaries (optional logic, 
    // but usually we just want the lens to follow the mouse, the background position handles the "clamping" visually)
    // However, for the background position calculation:
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > width) x = width;
    if (y > height) y = height;

    setXY({ x, y });
  };

  return (
    <div 
        className={`flex items-center justify-center w-full h-full ${className}`}
        style={{ 
            width: width, 
            height: height,
        }}
    >
      <div className="relative max-w-full max-h-full flex justify-center">
          <img
            src={src}
            alt={alt}
            className={`block max-w-full max-h-full w-auto h-auto object-contain ${showMagnifier ? 'cursor-none' : 'cursor-crosshair'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={onClick}
          />

          {watermarkSrc && (
              <div className="absolute top-6 left-6 pointer-events-none z-10">
                  <img 
                    src={watermarkSrc} 
                    alt="" 
                    className="w-24 h-auto object-contain mix-blend-difference opacity-80" 
                  />
              </div>
          )}

          <div
            style={{
              display: showMagnifier ? '' : 'none',
              position: 'absolute',

              // Prevent the magnifier from blocking mouse events
              pointerEvents: 'none',

              // Dimensions
              height: `${magnifierHeight}px`,
              width: `${magnifierWidth}px`,

              // Position centered on cursor
              top: `${xy.y - magnifierHeight / 2}px`,
              left: `${xy.x - magnifierWidth / 2}px`,
              
              // Styling for "Professional Lens" look
              borderRadius: '50%',
              border: '2px solid white', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 2px 4px rgba(0,0,0,0.1)', // Outer shadow + subtle inner depth
              backgroundColor: 'white',
              
              // Magnified Image
              backgroundImage: `url('${src}')`,
              backgroundRepeat: 'no-repeat',
              
              // Size: scale up the observed image size
              backgroundSize: `${imgSize.width * zoomLevel}px ${imgSize.height * zoomLevel}px`,

              // Position: Shift background to match the relative position
              backgroundPositionX: `${-xy.x * zoomLevel + magnifierWidth / 2}px`,
              backgroundPositionY: `${-xy.y * zoomLevel + magnifierHeight / 2}px`
            }}
          />
      </div>
    </div>
  );
}
