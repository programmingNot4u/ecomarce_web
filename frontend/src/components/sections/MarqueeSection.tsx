import { motion } from 'framer-motion';

interface Props {
    content: {
        text: string;
    };
    style?: {
        backgroundColor?: string;
        textColor?: string;
    }
}

const MarqueeSection = ({ content, style }: Props) => {
    // Default styles
    const bgColor = style?.backgroundColor || 'bg-black';
    const txtColor = style?.textColor || 'text-white';

    // Handle hex vs class? For simplicity assumes classes for now or inline
    const isHexBg = bgColor.startsWith('#');
    
    return (
        <div 
            className={`py-4 overflow-hidden whitespace-nowrap ${!isHexBg ? bgColor : ''}`}
            style={isHexBg ? { backgroundColor: bgColor } : {}}
        >
            <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="flex space-x-12 items-center"
            >
                 {[...Array(10)].map((_, i) => (
                    <span 
                        key={i} 
                        className={`text-sm font-medium uppercase tracking-[0.2em] ${txtColor}`}
                        style={style?.textColor?.startsWith('#') ? { color: style.textColor } : {}}
                    >
                        {content.text}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export default MarqueeSection;
