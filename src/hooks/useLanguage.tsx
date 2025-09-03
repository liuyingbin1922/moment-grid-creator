import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    // Header
    title: "九宫格照片工具",
    subtitle: "制作时尚的社交媒体图片拼接，适用于朋友圈、Instagram等平台",
    
    // Buttons
    uploadImages: "上传图片",
    downloadGrid: "下载九宫格",
    resetGrid: "重置网格",
    
    // Upload Zone
    dragHere: "拖拽图片到这里",
    orClick: "或点击上方\"上传图片\"按钮选择文件",
    supportedFormats: "支持 JPG、PNG、GIF 格式，最多上传 9 张图片",
    
    // Grid
    position: "位置",
    
    // Toast Messages
    fileFormatError: "文件格式错误",
    fileFormatErrorDesc: "请上传图片文件（JPG, PNG, GIF等）",
    gridFull: "网格已满",
    gridFullDesc: "请先删除一些图片或重置网格",
    uploadSuccess: "图片上传成功",
    uploadSuccessDesc: "已添加",
    uploadSuccessDesc2: "张图片",
    gridReset: "网格已重置",
    gridResetDesc: "所有图片已清除",
    noImages: "没有图片",
    noImagesDesc: "请先上传一些图片",
    downloadSuccess: "下载成功",
    downloadSuccessDesc: "九宫格图片已保存到您的设备",
    
    // SEO
    metaDescription: "免费在线九宫格照片制作工具，轻松制作朋友圈、Instagram风格的图片拼接。支持拖拽上传，一键生成时尚九宫格图片布局。",
    metaKeywords: "九宫格,照片拼接,朋友圈图片,Instagram网格,图片制作工具,在线拼图"
  },
  en: {
    // Header
    title: "Photo Grid Tool",
    subtitle: "Create stylish social media photo collages for WeChat Moments, Instagram and other platforms",
    
    // Buttons
    uploadImages: "Upload Images",
    downloadGrid: "Download Grid",
    resetGrid: "Reset Grid",
    
    // Upload Zone
    dragHere: "Drag images here",
    orClick: "or click the \"Upload Images\" button above to select files",
    supportedFormats: "Supports JPG, PNG, GIF formats, up to 9 images",
    
    // Grid
    position: "Position",
    
    // Toast Messages
    fileFormatError: "File format error",
    fileFormatErrorDesc: "Please upload image files (JPG, PNG, GIF, etc.)",
    gridFull: "Grid is full",
    gridFullDesc: "Please delete some images or reset the grid first",
    uploadSuccess: "Images uploaded successfully",
    uploadSuccessDesc: "Added",
    uploadSuccessDesc2: "images",
    gridReset: "Grid reset",
    gridResetDesc: "All images have been cleared",
    noImages: "No images",
    noImagesDesc: "Please upload some images first",
    downloadSuccess: "Download successful",
    downloadSuccessDesc: "Grid image has been saved to your device",
    
    // SEO
    metaDescription: "Free online photo grid maker tool. Easily create WeChat Moments and Instagram-style photo collages. Supports drag & drop upload and one-click stylish grid generation.",
    metaKeywords: "photo grid,photo collage,WeChat moments,Instagram grid,photo maker tool,online collage"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    // Check if user has a saved language preference
    const savedLanguage = localStorage.getItem('photo-grid-language') as Language;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    } else {
      // Auto-detect browser language
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.includes('zh')) {
        setLanguage('zh');
      } else {
        setLanguage('en');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('photo-grid-language', lang);
    
    // Update document language and meta tags
    document.documentElement.lang = lang;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', translations[lang].metaDescription);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', translations[lang].metaKeywords);
    }
    
    // Update title
    document.title = lang === 'zh' 
      ? "九宫格照片工具 - 社交媒体图片拼接神器"
      : "Photo Grid Tool - Social Media Photo Collage Maker";
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['zh']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};