import React, { useEffect, useRef, useState } from 'react';

interface PriceRangeSliderProps {
    min: number;
    max: number;
    onChange: (min: number, max: number) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ min, max, onChange }) => {
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const minValRef = useRef(min);
    const maxValRef = useRef(max);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

    // Set width of the range to decrease from the left side
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, min, max]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, min, max]);

    return (
        <div className="w-full">
            <h3 className="text-gray-900 font-medium mb-4">Filter by price</h3>
            
            <div className="relative w-full h-8 mb-4">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={(event) => {
                        const value = Math.min(Number(event.target.value), maxVal - 1);
                        setMinVal(value);
                        minValRef.current = value;
                    }}
                    className="thumb thumb--left pointer-events-none absolute h-0 w-full outline-none z-30"
                    style={{ zIndex: minVal > max - 100 ? 5 : undefined }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={(event) => {
                        const value = Math.max(Number(event.target.value), minVal + 1);
                        setMaxVal(value);
                        maxValRef.current = value;
                    }}
                    className="thumb thumb--right pointer-events-none absolute h-0 w-full outline-none z-40"
                />

                <div className="relative w-full">
                    <div className="absolute h-1 w-full bg-gray-200 rounded-full z-10 transition-all duration-300" />
                    <div ref={range} className="absolute h-1 bg-black rounded-full z-20 transition-all duration-300" />
                </div>
                
                {/* Custom styling for range inputs is needed in global CSS or here via style tag if not using global */}
                <style>{`
                    .thumb::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        -webkit-tap-highlight-color: transparent;
                        pointer-events: auto;
                        height: 16px;
                        width: 16px;
                        border-radius: 50%;
                        background-color: #000000;
                        cursor: pointer;
                        margin-top: -6px; /* Adjust based on track height */
                        border: 2px solid white;
                        box-shadow: 0 0 0 1px #e5e7eb;
                        position: relative;
                        z-index: 50;
                    }
                    .thumb::-moz-range-thumb {
                        pointer-events: auto;
                        height: 16px;
                        width: 16px;
                        border-radius: 50%;
                        background-color: #000000;
                        cursor: pointer;
                        border: 2px solid white;
                        box-shadow: 0 0 0 1px #e5e7eb;
                    }
                `}</style>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-gray-600 text-sm">
                    Price: <span className="font-medium text-black">Tk {minVal.toLocaleString()} — Tk {maxVal.toLocaleString()}</span>
                </div>
                <button 
                    onClick={() => onChange(minVal, maxVal)}
                    className="bg-black text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-sm"
                >
                    Filter
                </button>
            </div>
        </div>
    );
};

export default PriceRangeSlider;
