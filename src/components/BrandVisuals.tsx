import React, { useState } from 'react';
import heroThaliImg from '../assets/images/hero_thali_meal_1791364182432.jpg';
import founderPortraitImg from '../assets/images/WhatsApp Image 2026-10-07 at 10.39.47 PM.jpeg';
import companyLogoImg from '../assets/images/kalyansetu_company_logo_1791394342748.jpg';
import communityDiningImg from '../assets/images/community_dining_1791364207685.jpg';

export const HERO_IMAGE_PATH = heroThaliImg;
export const FOUNDER_IMAGE_PATH = founderPortraitImg;
export const COMPANY_LOGO_PATH = companyLogoImg;
export const COMMUNITY_IMAGE_PATH = communityDiningImg;

export const FOUNDER_EMAIL = 'rdivyansh088@gmail.com';
export const FOUNDER_LINKEDIN_URL = 'https://in.linkedin.com/in/divyansh-rai-76907236a';
export const FOUNDER_INSTAGRAM_URL =
  'https://www.instagram.com/builtbydivyanshh?stkn=ZGhucHkzanRsMGZv';

export function KalyanSetuLogo({
  variant = 'navy',
  size = 'md',
}: {
  variant?: 'navy' | 'white';
  size?: 'sm' | 'md' | 'lg';
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const textColor = variant === 'white' ? '#FFFFFF' : '#1A2A4A';
  const iconDimensions = size === 'sm' ? 34 : size === 'lg' ? 48 : 40;
  const textClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
        ? 'text-2xl'
        : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      {!imgFailed && COMPANY_LOGO_PATH ? (
        <span
          className="rounded-full overflow-hidden border border-[#C9A227] bg-[#F5EFE0] shrink-0 flex items-center justify-center shadow-2xs"
          style={{ width: iconDimensions, height: iconDimensions }}
        >
          <img
            src={COMPANY_LOGO_PATH}
            alt="KalyanSetu Logo"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        </span>
      ) : (
        <svg
          width={iconDimensions}
          height={iconDimensions}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="rounded-full bg-[#F5EFE0] border border-[#C9A227] p-1 shrink-0"
        >
          {/* Rising golden sun arch */}
          <path
            d="M20 29C20 22.3726 25.3726 17 32 17C38.6274 17 44 22.3726 44 29"
            stroke="#B58318"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Sun rays */}
          <path
            d="M32 8V13M24 10L26 14.5M17 15L20.5 18.5M12 22L16.5 24M40 10L38 14.5M47 15L43.5 18.5M52 22L47.5 24"
            stroke="#B58318"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Center golden leaf */}
          <path
            d="M32 21C36 25 36 32 32 37C28 32 28 25 32 21Z"
            fill="#B58318"
          />
          {/* Left & Right Navy Leaves */}
          <path
            d="M14 31C22 31 28 35 30 43C21 44 15 39 14 31Z"
            fill="#0A3363"
          />
          <path
            d="M50 30C42 30 36 34 34 42C43 43 49 38 50 30Z"
            fill="#0A3363"
          />
          {/* Cradling Navy Hand */}
          <path
            d="M16 44C22 52 40 54 48 42C42 41 36 44 31 47C26 48 20 47 16 44Z"
            fill="#0A3363"
          />
        </svg>
      )}
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
