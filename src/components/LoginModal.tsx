import React from 'react';
import { Language, UserProfile, UserRole } from '../types';
import { ModernAuthModal } from './ModernAuthModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (user: UserProfile) => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
  onLanguageChange?: (lang: Language) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLoginSuccess,
  initialRole = 'passenger',
  initialMode = 'login',
  onLanguageChange,
}) => {
  return (
    <ModernAuthModal
      isOpen={isOpen}
      onClose={onClose}
      lang={lang}
      onLoginSuccess={onLoginSuccess}
      initialRole={initialRole}
      initialMode={initialMode}
      onLanguageChange={onLanguageChange}
    />
  );
};

