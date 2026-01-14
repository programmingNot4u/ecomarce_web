import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface Props {
    content: {
        title: string;
        text: string;
        linkText?: string;
        linkUrl?: string;
    };
    style?: {
        backgroundColor?: string;
        textColor?: string;
        padding?: string;
    }
}

const TextSection = ({ content, style }: Props) => {
    const { theme } = useTheme();
    
    // Check if background is a Tailwind class vs hex
    const bgClass = style?.backgroundColor?.startsWith('bg-') ? style.backgroundColor : '';
    const bgStyle = !bgClass && style?.backgroundColor ? { backgroundColor: style.backgroundColor } : {};

    return (
        <section 
            className={`text-center px-6 ${style?.padding || 'py-16'} ${bgClass}`}
            style={bgStyle}
        >
             <div className="max-w-2xl mx-auto space-y-6">
                <h3 
                    className="text-2xl font-bold uppercase tracking-widest"
                    style={{ fontFamily: theme.typography.headingFont, color: style?.textColor || theme.colors.text }}
                >
                    {content.title}
                </h3>
                <p 
                    className="leading-relaxed max-w-lg mx-auto"
                    style={{ fontFamily: theme.typography.bodyFont, color: style?.textColor ? style.textColor : theme.colors.text, opacity: 0.8 }}
                >
                    {content.text}
                </p>
                {content.linkText && content.linkUrl && (
                    <Link 
                        to={content.linkUrl} 
                        className="inline-block border-b pb-1 text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-70"
                        style={{ borderColor: style?.textColor || theme.colors.text, color: style?.textColor || theme.colors.text }}
                    >
                        {content.linkText}
                    </Link>
                )}
             </div>
        </section>
    );
};

export default TextSection;
