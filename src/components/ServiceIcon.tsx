import React from 'react';
import {
  MessageCircle,
  Send,
  Sparkles,
  Mail,
  Camera,
  Headphones,
  Layers,
  Flame,
  ShoppingBag,
  Navigation,
  Coins,
  Gamepad2,
  Video,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

interface ServiceIconProps {
  name: string;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name?.toLowerCase()) {
    case 'messagecircle':
    case 'whatsapp':
      return <MessageCircle className={`${className} text-emerald-400`} />;
    case 'send':
    case 'telegram':
      return <Send className={`${className} text-sky-400`} />;
    case 'sparkles':
    case 'openai':
    case 'chatgpt':
      return <Sparkles className={`${className} text-teal-400`} />;
    case 'mail':
    case 'google':
    case 'gmail':
      return <Mail className={`${className} text-red-400`} />;
    case 'camera':
    case 'instagram':
      return <Camera className={`${className} text-pink-400`} />;
    case 'twitter':
    case 'x':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${className} text-blue-400`}
        >
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      );
    case 'headphones':
    case 'discord':
      return <Headphones className={`${className} text-indigo-400`} />;
    case 'layers':
    case 'microsoft':
      return <Layers className={`${className} text-cyan-400`} />;
    case 'flame':
    case 'tinder':
      return <Flame className={`${className} text-rose-500`} />;
    case 'shoppingbag':
    case 'amazon':
      return <ShoppingBag className={`${className} text-amber-400`} />;
    case 'navigation':
    case 'uber':
      return <Navigation className={`${className} text-zinc-300`} />;
    case 'coins':
    case 'binance':
      return <Coins className={`${className} text-yellow-400`} />;
    case 'gamepad2':
    case 'steam':
      return <Gamepad2 className={`${className} text-purple-400`} />;
    case 'video':
    case 'tiktok':
      return <Video className={`${className} text-fuchsia-400`} />;
    default:
      return <Smartphone className={`${className} text-indigo-400`} />;
  }
};
