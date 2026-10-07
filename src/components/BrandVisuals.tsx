import React, { useState } from 'react';
import heroThaliImg from '../assets/images/hero_thali_meal_1791364182432.jpg';
import founderPortraitImg from '../assets/images/founder_portrait_1791364196333.jpg';
import communityDiningImg from '../assets/images/community_dining_1791364207685.jpg';

export const HERO_IMAGE_PATH = heroThaliImg;
export const FOUNDER_IMAGE_PATH = founderPortraitImg;
export const COMMUNITY_IMAGE_PATH = communityDiningImg;

export function KalyanSetuLogo({
  variant = 'navy',
  size = 'md',
}: {
  variant?: 'navy' | 'white';
  size?: 'sm' | 'md' | 'lg';
}) {
  const textColor = variant === 'white' ? '#FFFFFF' : '#1A2A4A';
  const iconDimensions = size === 'sm' ? 28 : size === 'lg' ? 40 : 34;
  const textClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
        ? 'text-2xl'
        : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg
        width={iconDimensions}
        height={iconDimensions}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22" stroke="#C9A227" strokeWidth="2" />
        {/* Bridge arch */}
        <path
          d="M8 31C12.5 23 18 19 24 19C30 19 35.5 23 40 31"
          stroke="#C9A227"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M6 34H42"
          stroke={variant === 'white' ? '#FFFFFF' : '#1A2A4A'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Nourishing bowl & warm steam */}
        <path
          d="M16 25H32C32 29.4183 28.4183 33 24 33C19.5817 33 16 29.4183 16 25Z"
          fill="#C9A227"
        />
        <path
          d="M21 15C21 13 22.5 12 22.5 10M27 15C27 13 28.5 12 28.5 10"
          stroke="#C9A227"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-serif-heading font-bold tracking-tight ${textClass}`}
        style={{ color: textColor }}
      >
        KalyanSetu
      </span>
    </span>
  );
}

export function BotanicalLeafSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M165 15C115 20 65 55 35 125C85 105 135 70 165 15Z"
        stroke="#C9A227"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />
      <path
        d="M165 15C120 55 75 90 20 140"
        stroke="#C9A227"
        strokeWidth="1.2"
        strokeOpacity="0.3"
      />
      <path
        d="M115 55C100 45 82 48 70 58M90 80C75 70 58 74 46 86M135 35C122 28 108 32 98 40"
        stroke="#C9A227"
        strokeWidth="1.2"
        strokeOpacity="0.28"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MountainWaveSvg({
  fill = '#EDE4CC',
  className = '',
}: {
  fill?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={`w-full h-10 md:h-14 block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0 40L120 26C240 12 480 4 720 18C960 32 1200 52 1320 44L1440 36V64H1320C1200 64 960 64 720 64C480 64 240 64 120 64H0V40Z"
        fill={fill}
      />
      <path
        d="M0 40L120 26C240 12 480 4 720 18C960 32 1200 52 1320 44L1440 36"
        stroke="#C9A227"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function VisionCurveSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M120 0C120 66.2742 66.2742 120 0 120"
        stroke="#C9A227"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <path
        d="M120 28C120 78.8102 78.8102 120 28 120"
        stroke="#C9A227"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
    </svg>
  );
}

export function GoogleGLogo({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function ResilientImage({
  src,
  alt,
  className = '',
  eager = false,
  fallbackLabel = 'KalyanSetu',
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EDE4CC] text-[#1A2A4A] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <KalyanSetuLogo variant="navy" size="md" />
        <p className="mt-2 text-xs text-[#7A6A50] font-garamond italic">{fallbackLabel}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
