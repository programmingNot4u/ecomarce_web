import React, { useState } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt }) => {
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <figure 
      onMouseMove={handleMouseMove} 
      className="relative w-full h-full overflow-hidden cursor-crosshair group"
      style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: backgroundPosition,
      }}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300" 
      />
    </figure>
  );
};

export default ImageZoom;
