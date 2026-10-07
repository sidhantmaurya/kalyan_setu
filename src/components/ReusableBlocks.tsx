import React from 'react';
import { CheckCircle2, Clock, ArrowRight, ArrowDown, Sparkles } from 'lucide-react';
import { FOUNDER_IMAGE_PATH, ResilientImage, VisionCurveSvg } from './BrandVisuals';

// 16.1 Section Label
export function SectionLabel({
  children,
  centered = false,
  variant = 'gold',
}: {
  children: React.ReactNode;
  centered?: boolean;
  variant?: 'gold' | 'navy';
}) {
  const textColor = variant === 'navy' ? 'text-[#1A2A4A]' : 'text-[#C9A227]';
  const lineBg = variant === 'navy' ? 'bg-[#1A2A4A]' : 'bg-[#C9A227]';

  return (
    <div
      className={
        centered
          ? 'flex flex-col items-center text-center mb-3'
          : 'flex flex-col items-start mb-3'
      }
    >
      <div className="inline-flex items-center gap-2.5">
        {centered && <span className={`w-6 h-[1px] ${lineBg} opacity-70`} aria-hidden="true" />}
        <span
          className={`text-xs md:text-[13px] font-bold uppercase tracking-[3px] ${textColor}`}
        >
          {children}
        </span>
        <span className={`text-[10px] ${textColor} opacity-80`} aria-hidden="true">
          ◆
        </span>
        {centered && <span className={`w-6 h-[1px] ${lineBg} opacity-70`} aria-hidden="true" />}
      </div>
      <div className={`w-20 h-[1.5px] ${lineBg} mt-2.5 mb-2`} aria-hidden="true" />
    </div>
  );
}

// 16.2 Numbered Card (for Who We Serve)
export function NumberedCard({
  number,
  title,
  description,
  extendedStory,
}: {
  number: string;
  title: string;
  description: string;
  extendedStory?: string;
}) {
  return (
    <article className="group relative bg-[#F5EFE0] border border-[#C9A227]/70 hover:border-[#C9A227] rounded-2xl p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-luxury flex flex-col justify-between overflow-hidden">
      {/* Subtle top-right architectural corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#C9A227]/12 to-transparent pointer-events-none transition-opacity group-hover:opacity-100 opacity-60"
        aria-hidden="true"
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#1A2A4A] border border-[#C9A227] flex items-center justify-center shadow-xs group-hover:bg-[#C9A227] transition-colors duration-300">
            <span className="font-serif-heading text-lg font-bold text-[#E8C96A] group-hover:text-[#1A2A4A] tabular-nums transition-colors duration-300">
              {number}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#7A6A50]/70">
            Community · {number}
          </span>
        </div>

        <h3 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-3 group-hover:text-[#1A2A4A]">
          {title}
        </h3>
        <p className="text-[#3D3520] text-base leading-relaxed">{description}</p>
      </div>

      {extendedStory && (
        <p className="mt-5 pt-5 border-t border-[#C9A227]/35 text-[#3D3520] leading-relaxed font-garamond italic text-xl">
          &ldquo;{extendedStory}&rdquo;
        </p>
      )}
    </article>
  );
}

// 16.3 Pillar Card (for 4 pillars)
export function PillarCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative bg-[#EDE4CC] border border-[#C9A227]/50 border-t-[4px] border-t-[#C9A227] rounded-2xl p-7 text-center transition-all duration-300 hover:-translate-y-1.5 hover:bg-[#F5EFE0] shadow-luxury flex flex-col items-center">
      <div
        className="w-14 h-14 rounded-full bg-[#1A2A4A] border-2 border-[#C9A227] text-[#E8C96A] group-hover:bg-[#C9A227] group-hover:text-white flex items-center justify-center mb-4 shrink-0 transition-colors duration-300 shadow-xs"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="font-serif-heading text-xl font-bold text-[#1A2A4A] tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-[#7A6A50] text-sm font-semibold tracking-wide">{description}</p>
    </div>
  );
}

// 16.4 Milestone Checkmark Row
export function MilestoneRow({
  status,
  title,
  description,
}: {
  status: 'done' | 'pending';
  title: string;
  description?: string;
}) {
  const isDone = status === 'done';
  return (
    <div
      className={`bg-[#F5EFE0] rounded-xl px-5 py-4 border-l-4 ${
        isDone ? 'border-l-[#C9A227]' : 'border-l-[#1A2A4A]'
      } border border-[#C9A227]/35 flex items-start justify-between gap-4 transition-all duration-200 hover:translate-x-1 shadow-xs`}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 shrink-0" aria-hidden="true">
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-[#C9A227]" />
          ) : (
            <Clock className="w-5 h-5 text-[#1A2A4A]" />
          )}
        </div>
        <div>
          <h4 className="font-body font-bold text-base text-[#1A2A4A] leading-snug">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-[#7A6A50] mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      <span
        className={`hidden sm:inline-block shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${
          isDone
            ? 'bg-[#C9A227]/15 text-[#1A2A4A] border border-[#C9A227]/40'
            : 'bg-[#1A2A4A]/10 text-[#7A6A50] border border-[#1A2A4A]/20'
        }`}
      >
        {isDone ? 'Completed' : 'Planned'}
      </span>
    </div>
  );
}

// 16.5 Blockquote
export function GoldBlockquote({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <blockquote
      className={`border-l-4 border-[#C9A227] pl-6 py-2 font-garamond italic text-2xl md:text-[26px] text-[#1A2A4A] leading-relaxed ${className}`}
    >
      {children}
    </blockquote>
  );
}

// 16.6 Gold Border Vision Card
export function VisionCard() {
  return (
    <div className="relative border-2 border-[#C9A227] rounded-2xl px-7 py-10 md:px-14 md:py-14 bg-cream-luxury text-center max-w-3xl mx-auto overflow-hidden shadow-luxury">
      <VisionCurveSvg className="absolute top-0 right-0 pointer-events-none" />
      <SectionLabel centered>FOUNDER&apos;S VISION</SectionLabel>
      <h2 className="font-serif-heading text-3xl md:text-4xl font-bold text-[#1A2A4A] mb-3">
        My Vision
      </h2>
      <h3 className="font-garamond italic text-2xl md:text-3xl text-[#C9A227] font-semibold mb-5">
        &ldquo;Nourishment should never be a privilege of income.&rdquo;
      </h3>
      <p className="text-[#3D3520] text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
        We envision a future where no one has to go without a nourishing meal simply because they
        cannot afford it — where affordable, trustworthy food reaches those who need it most, while
        creating sustainable opportunities for the communities that produce it.
      </p>
    </div>
  );
}

// 16.7 Founder Avatar Card
export function FounderAvatarBlock({
  size = 'md',
  quote = '"Food can do more than just fill your stomach."',
  showUniversity = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  quote?: string;
  showUniversity?: boolean;
}) {
  const imgSize =
    size === 'sm'
      ? 'w-24 h-24'
      : size === 'lg'
        ? 'w-48 h-48'
        : 'w-40 h-40';

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-5">
        <div
          className="absolute -inset-1.5 rounded-full border border-[#C9A227] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className={`${imgSize} rounded-full border-[3px] border-[#1A2A4A] overflow-hidden shadow-luxury`}
        >
          <ResilientImage
            src={FOUNDER_IMAGE_PATH}
            alt="Divyansh Rai, Founder of KalyanSetu"
            className="w-full h-full object-cover"
            fallbackLabel="Divyansh Rai"
          />
        </div>
      </div>

      <h3 className="font-serif-heading text-2xl font-bold text-[#1A2A4A]">Divyansh Rai</h3>
      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[2.5px] text-[#C9A227] mt-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>FOUNDER, KALYANSETU</span>
      </div>
      {showUniversity && (
        <p className="text-sm text-[#7A6A50] mt-1.5 font-medium">Central University of Kerala</p>
      )}
      {quote && (
        <p className="font-garamond italic text-xl md:text-2xl text-[#1A2A4A] mt-4 max-w-sm leading-snug">
          {quote}
        </p>
      )}
    </div>
  );
}

// 16.8 Step Flow (3-step process)
export function StepFlow({
  steps,
}: {
  steps: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 lg:gap-6">
      {steps.map((step, idx) => (
        <React.Fragment key={step.title}>
          <div className="relative flex-1 bg-white border border-[#C9A227]/60 rounded-2xl p-8 text-center flex flex-col items-center shadow-luxury transition-all duration-300 hover:-translate-y-1.5">
            <span className="absolute top-4 right-5 font-serif-heading text-xs font-bold uppercase tracking-widest text-[#C9A227] tabular-nums">
              0{idx + 1}
            </span>
            <div
              className="w-14 h-14 rounded-full bg-[#1A2A4A] border-2 border-[#C9A227] text-[#E8C96A] flex items-center justify-center mb-5 shrink-0 shadow-xs"
              aria-hidden="true"
            >
              {step.icon}
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-[#1A2A4A] mb-2.5">
              {step.title}
            </h3>
            <p className="text-[#7A6A50] text-base leading-relaxed">{step.description}</p>
          </div>
          {idx < steps.length - 1 && (
            <div
              className="flex items-center justify-center text-[#C9A227] py-1 lg:py-0"
              aria-hidden="true"
            >
              <ArrowRight className="hidden lg:block w-7 h-7" />
              <ArrowDown className="block lg:hidden w-6 h-6" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
