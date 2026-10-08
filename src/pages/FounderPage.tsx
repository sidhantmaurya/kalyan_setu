import React from 'react';
import { Link } from 'react-router-dom';
import { FOUNDER_IMAGE_PATH, ResilientImage } from '../components/BrandVisuals';
import { SectionLabel, GoldBlockquote, VisionCard } from '../components/ReusableBlocks';

export function FounderPage() {
  return (
    <div>
      {/* F1 — Hero (Cream background) */}
      <section className="bg-[#F5EFE0] py-16 md:py-24 px-4 sm:px-6 text-center border-b border-[#C9A227]/30">
        <div className="max-w-[860px] mx-auto flex flex-col items-center">
          <SectionLabel centered>FOUNDER</SectionLabel>
          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A2A4A] mb-3">
            Divyansh Rai
          </h1>
          <p className="font-garamond italic text-xl md:text-2xl text-[#7A6A50] mb-8">
            Founder of KalyanSetu | Student, Central University of Kerala
          </p>

          <div className="w-44 h-44 rounded-full border-[3px] border-[#1A2A4A] overflow-hidden shadow-md mb-6">
            <ResilientImage
              src={FOUNDER_IMAGE_PATH}
              alt="Divyansh Rai, Founder of KalyanSetu"
              eager={true}
              className="w-full h-full object-cover"
              fallbackLabel="Divyansh Rai"
            />
          </div>

          <p className="font-garamond italic text-xl sm:text-[22px] text-[#C9A227] max-w-2xl leading-relaxed font-semibold mb-6">
            &ldquo;Food can do more than just fill your stomach. It can build healthier lives,
            stronger communities and a kinder tomorrow.&rdquo;
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href="mailto:rdivyansh088@gmail.com"
              className="px-4 py-2 rounded-lg bg-[#EDE4CC] border border-[#C9A227] text-[#1A2A4A] font-bold hover:bg-[#C9A227] hover:text-white transition-colors"
            >
              rdivyansh088@gmail.com
            </a>
            <a
              href="https://in.linkedin.com/in/divyansh-rai-76907236a"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-[#1A2A4A] text-[#E8C96A] font-bold hover:bg-[#C9A227] hover:text-white transition-colors"
            >
              LinkedIn Profile
            </a>
            <a
              href="https://www.instagram.com/builtbydivyanshh?stkn=ZGhucHkzanRsMGZv"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg border-2 border-[#1A2A4A] text-[#1A2A4A] font-bold hover:bg-[#1A2A4A] hover:text-white transition-colors"
            >
              Instagram (@builtbydivyanshh)
            </a>
          </div>
        </div>
      </section>

      {/* F2 — Who He Is */}
      <section className="bg-[#EDE4CC] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[860px] mx-auto">
          <SectionLabel>FOUNDER STORY</SectionLabel>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[44px] font-bold text-[#1A2A4A] leading-tight mb-6">
            The Person Behind Kalyan Setu
          </h2>
          <div className="space-y-5 text-[#3D3520] text-lg leading-[1.8]">
            <p>
              Divyansh Rai is the founder of Kalyan Setu, an early-stage initiative built around a
              simple belief: access to nourishing food should not depend entirely on a person&apos;s
              income.
            </p>
            <p>
              He completed his 10+2 education and is currently pursuing his graduation at the
              Central University of Kerala. Alongside his academic journey, he is working on
              building Kalyan Setu with a long-term focus on affordable nourishment, dignity and
              sustainable community impact.
            </p>
          </div>
        </div>
      </section>

      {/* F3 — Why He Started It */}
      <section className="bg-[#F5EFE0] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[860px] mx-auto">
          <SectionLabel>PURPOSE</SectionLabel>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[44px] font-bold text-[#1A2A4A] leading-tight mb-6">
            Why I Started Kalyan Setu
          </h2>

          <GoldBlockquote className="mb-8 bg-[#EDE4CC] p-6 rounded-r-lg">
            &ldquo;Because no one should have to go without a nourishing meal simply because they
            cannot afford it.&rdquo;
          </GoldBlockquote>

          <div className="space-y-5 text-[#3D3520] text-lg leading-[1.8]">
            <p>
              For many people, food is not simply a matter of preference or convenience. There are
              people who struggle to afford even a basic, nourishing meal. Kalyan Setu is being
              built with those people at the centre of its purpose.
            </p>
            <p>
              The vision goes beyond providing food at a lower price. It is about making nourishment
              more accessible, maintaining trust and quality, and creating a system that can grow
              sustainably rather than depending only on short-term charity.
            </p>
            <p>
              Students, daily-wage and working individuals, drivers, people living away from home,
              low-income families and others who struggle with affordable access to good food can
              all be part of the communities Kalyan Setu aims to serve.
            </p>
          </div>
        </div>
      </section>

      {/* F4 — His Vision */}
      <section className="bg-[#EDE4CC] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          <VisionCard />
        </div>
      </section>

      {/* F5 — What He's Building */}
      <section className="bg-[#F5EFE0] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[860px] mx-auto">
          <SectionLabel>WHAT I&apos;M BUILDING</SectionLabel>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[44px] font-bold text-[#1A2A4A] leading-tight mb-6">
            A bridge between good food and the people who need it most.
          </h2>
          <p className="text-[#3D3520] text-lg leading-[1.8]">
            KalyanSetu is an initiative to make nourishing, affordable and accessible food a reality
            for the people who spend most of their day away from home. It starts with a simple
            belief that food can build healthier lives, stronger communities and a kinder tomorrow.
          </p>
        </div>
      </section>

      {/* F6 — Founder Statement (closing quote) */}
      <section className="bg-[#1A2A4A] text-white py-16 md:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-[900px] mx-auto">
          <div
            className="font-serif-heading text-6xl text-[#C9A227] leading-none mb-3 select-none"
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <p className="font-serif-heading text-2xl sm:text-3xl text-white leading-relaxed mb-4">
            &ldquo;It all starts with a simple belief — that food can do more than just fill your
            stomach.&rdquo;
          </p>
          <p className="font-garamond italic text-xl text-[#E8C96A]">
            — Divyansh Rai, Founder, KalyanSetu
          </p>
        </div>
      </section>

      {/* F7 — CTA */}
      <section className="bg-[#EDE4CC] py-14 md:py-16 px-4 sm:px-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/contact"
            className="px-9 py-3.5 bg-[#C9A227] text-white font-bold rounded-[4px] hover:bg-[#b38f20] hover:shadow-md transition-all whitespace-nowrap"
          >
            Support Our Mission
          </Link>
          <Link
            to="/progress"
            className="px-9 py-3.5 bg-transparent border-2 border-[#1A2A4A] text-[#1A2A4A] font-bold rounded-[4px] hover:bg-[#1A2A4A] hover:text-white transition-all whitespace-nowrap"
          >
            See Our Progress
          </Link>
        </div>
      </section>
    </div>
  );
}
