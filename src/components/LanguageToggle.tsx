import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="glass border-primary/20 hover:border-primary/40 fixed top-4 right-4 z-50"
    >
      <Globe className="w-4 h-4 mr-2" />
      {language === 'zh' ? 'EN' : '中文'}
    </Button>
  );
};

export default LanguageToggle;