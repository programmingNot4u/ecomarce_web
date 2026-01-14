import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../services/api';

export type CardStyle = 'minimal' | 'modern' | 'glass' | 'border';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  cardFont: string;
  scale: number;
}

export interface HomeSection {
  id: string;
  type: 'hero' | 'features' | 'products' | 'text' | 'marquee' | 'brands' | 'shipping' | 'flash_sale' | 'category' | 'kcbazar_category' | 'kcbazar_ads';
  visible?: boolean; // Default true
  content?: any;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    fullWidth?: boolean;
    className?: string;
  };
  settings?: any; // e.g., 'grid-cols-4', 'autoplay'
}

export interface ProductPageConfig {
  layout: 'classic' | 'modern_centered' | 'immersive';
  showRelatedProducts: boolean;
  showYouMayLike: boolean;
  showBreadcrumbs: boolean;
  galleryStyle: 'grid' | 'slider';
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  cardFont: string;
  scale: number;
}

export interface ThemeConfig {
  homeSections: HomeSection[];
  colors: ThemeColors;
  typography: ThemeTypography;
  cardStyle: CardStyle;
  logo: string;
  adminLogo?: string;
  footerLogo?: string;
  mode: 'light' | 'dark';
  productPage: ProductPageConfig;
  layouts: LayoutConfig;
  headerLayout: 'center' | 'left' | 'minimal';
  footerLayout: 'simple' | 'columns';
  enableLogoAnimation: boolean;
  textSnippets: {
    contact_phone: string;
    contact_email: string;
    contact_address: string;
    contact_whatsapp: string;
    contact_messenger: string;

    social_facebook: string;
    social_instagram: string;
    social_youtube: string;
    social_twitter: string;

    header_help_text: string;
    footer_copyright: string;
    footer_about_text: string;

    help_section_title: string;
  };
}


interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
  saveThemeNow: () => Promise<boolean>;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: '#4A4A4A',
    secondary: '#8D8D8D',
    accent: '#A68B5B',
    background: '#FAF9F6',
    text: '#333333',
  },
  typography: {
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Outfit, sans-serif',
    cardFont: 'Outfit, sans-serif',
    scale: 1,
  },
  cardStyle: 'minimal',
  logo: 'text',
  adminLogo: '',
  footerLogo: '',
  enableLogoAnimation: true,
  homeSections: [
    {
      id: "hero_main",
      type: "hero",
      visible: true,
      content: {
        title: "Elevate Your Style",
        subtitle: "Discover the Lifestyle Collection",
        buttonText: "Shop Now",
        buttonLink: "/shop"
      },
      style: { fullWidth: true }
    },
    {
      id: "cat_lifestyle",
      type: "category",
      visible: true,
      style: {
        padding: "py-16",
        backgroundColor: "transparent"
      }
    }
  ],
  productPage: {
    layout: 'classic',
    showRelatedProducts: true,
    showYouMayLike: true,
    showBreadcrumbs: true,
    galleryStyle: 'slider'
  },
  layouts: {
    shop: 'grid-4'
  },
  headerLayout: 'center',
  footerLayout: 'columns',
  textSnippets: {
    contact_phone: "09613660321",
    contact_email: "support@kcbazar.com",
    contact_address: "Dhaka, Bangladesh",
    contact_whatsapp: "017...",
    contact_messenger: "kcbazar",

    social_facebook: "#",
    social_instagram: "#",
    social_youtube: "#",
    social_twitter: "#",

    header_help_text: "Need Help? Call Us:",
    footer_copyright: "© 2024 Your Company. All rights reserved.",
    footer_about_text: "We are a premium e-commerce store providing high quality products.",

    help_section_title: "Need a Help?"
  }
};



const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to deep merge defaults
const mergeTheme = (saved: any): ThemeConfig => {
  return {
    ...defaultTheme,
    ...saved,
    homeSections: (saved.homeSections || saved.home_sections || defaultTheme.homeSections).filter((s: any) => s.type !== 'newsletter'),
    // Safely merge layouts
    layouts: {
      ...defaultTheme.layouts,
      ...(saved.layouts || {})
    },
    // Safely merge productPage (handle camel and snake)
    productPage: {
      ...defaultTheme.productPage,
      ...(saved.productPage || saved.product_page || {})
    },
    colors: { ...defaultTheme.colors, ...(saved.colors || {}) },
    typography: { ...defaultTheme.typography, ...(saved.typography || {}) },
    // Handle textSnippets (camel) and text_snippets (snake)
    textSnippets: {
      ...defaultTheme.textSnippets,
      ...(saved.textSnippets || saved.text_snippets || {})
    },
    // Map other potential snake_case fields that might be coming from DB
    cardStyle: saved.cardStyle || saved.card_style || defaultTheme.cardStyle,
    logo: saved.logo || defaultTheme.logo,
    adminLogo: saved.adminLogo || saved.admin_logo || defaultTheme.adminLogo,
    footerLogo: saved.footerLogo || saved.footer_logo || defaultTheme.footerLogo,
    enableLogoAnimation: saved.enableLogoAnimation !== undefined ? saved.enableLogoAnimation : (saved.enable_logo_animation !== undefined ? saved.enable_logo_animation : defaultTheme.enableLogoAnimation),
    headerLayout: saved.headerLayout || saved.header_layout || defaultTheme.headerLayout,
    footerLayout: saved.footerLayout || saved.footer_layout || defaultTheme.footerLayout,
  };
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize default, then fetch from API
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const savedTheme = localStorage.getItem('site_theme_config');
    if (savedTheme) {
      try {
        return mergeTheme(JSON.parse(savedTheme));
      } catch (e) {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  // Fetch from API on mount
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await api.get('/theme/active/');
        if (res.data && res.data.config && Object.keys(res.data.config).length > 0) {
          setTheme(prev => mergeTheme(res.data.config));
        }
      } catch (e) {
        console.error("Failed to fetch theme from API", e);
      }
    };
    fetchTheme();
  }, []);

  // Remove the old load-on-mount useEffect since we handle it in useState

  // Sync to CSS Variables
  useEffect(() => {
    const root = document.documentElement;

    // Colors
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-text', theme.colors.text);

    // Fonts
    root.style.setProperty('--font-heading', theme.typography.headingFont);
    root.style.setProperty('--font-body', theme.typography.bodyFont);
    root.style.setProperty('--font-card', theme.typography.cardFont || theme.typography.bodyFont);


    // Persist
    localStorage.setItem('site_theme_config', JSON.stringify(theme));
  }, [theme]);

  // Persist to Backend with Debounce


  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const updateColors = (colors: Partial<ThemeColors>) => {
    // Merge deeply into colors
    updateTheme({
      colors: { ...theme.colors, ...colors }
    });
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  const saveThemeNow = async () => {
    try {
      await api.post('/theme/update_active/', { config: theme });
      console.log('Theme saved manually');
      return true;
    } catch (e) {
      console.error("Failed to save theme manually", e);
      return false;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, updateColors, resetTheme, saveThemeNow }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
