import React from 'react';
import { Link } from 'react-router-dom';
import { Soup, Users } from 'lucide-react';
import { COMMUNITY_IMAGE_PATH, ResilientImage } from '../components/BrandVisuals';
import { SectionLabel, GoldBlockquote, VisionCard } from '../components/ReusableBlocks';

export function AboutPage() {
  return (
    <div>
      {/* A1 — Page Hero (navy background) */}
      <section className="bg-navy-luxury text-white py-20 md:py-28 px-4 sm:px-6 text-center border-b-2 border-[#C9A227]">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel centered>ABOUT KALYANSETU</SectionLabel>
          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Our Story
          </h1>
          <p className="font-garamond italic text-2xl sm:text-3xl text-[#E8C96A]">
            Why Kalyan Setu exists, and what we&apos;re building.
          </p>
        </div>
      </section>

      {/* A2 — What Kalyan Setu Means */}
      <section className="bg-cream-luxury py-18 md:py-26 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <SectionLabel>THE IDEA</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1A2A4A] leading-tight mb-6">
              The name &ldquo;Kalyan Setu&rdquo; — a bridge to welfare.
            </h2>
            <p className="text-[#3D3520] text-lg leading-[1.8] mb-5">
              &ldquo;Kalyan&rdquo; means welfare or well-being. &ldquo;Setu&rdquo; means bridge.
              Together, Kalyan Setu is a bridge between good food and the people who need it most —
              but cannot always access it. Every meal served is a step toward building that bridge.
            </p>
            <p className="font-garamond italic text-2xl text-[#C9A227] font-semibold">
              &ldquo;Because behind every meal, there is a story, a dream, and a person who keeps
              the world moving.&rdquo;
            </p>
          </div>
          <div className="lg:col-span-5 relative">
            <div
              className="hidden sm:block absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2 border-[#C9A227]/50 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative border-2 border-[#C9A227] rounded-2xl overflow-hidden shadow-luxury">
              <ResilientImage
                src={COMMUNITY_IMAGE_PATH}
                alt="Students and workers sharing a meal together in a clean, sunlit community dining hall"
                className="w-full aspect-16/9 lg:aspect-4/3 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* A3 — Why It Was Started (Purpose section) */}
      <section className="bg-[#EDE4CC] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[860px] mx-auto">
          <SectionLabel>PURPOSE</SectionLabel>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[44px] font-bold text-[#1A2A4A] leading-tight mb-6">
            Why I Started Kalyan Setu
          </h2>

          <GoldBlockquote className="mb-8 bg-[#F5EFE0] p-6 rounded-r-lg">
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

      {/* A4 — Mission & Vision (expanded layout + Gold border Vision card) */}
      <section className="bg-[#F5EFE0] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto space-y-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A2A4A] text-white rounded-xl p-8 md:p-10 border-t-4 border-[#C9A227]">
              <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] text-[#C9A227] flex items-center justify-center mb-5">
                <Soup className="w-6 h-6" />
              </div>
              <SectionLabel>OUR MISSION</SectionLabel>
              <p className="text-white/95 text-lg leading-[1.8]">
                To provide 1-grade quality food at the minimum possible cost and make it accessible
                to everyone, especially the underprivileged.
              </p>
            </div>

            <div className="bg-[#1A2A4A] text-white rounded-xl p-8 md:p-10 border-t-4 border-[#C9A227]">
              <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] text-[#C9A227] flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <SectionLabel>OUR VISION</SectionLabel>
              <p className="text-white/95 text-lg leading-[1.8]">
                To create a society where every individual, regardless of their income, can enjoy a
                healthy, wholesome and dignified meal every day.
              </p>
            </div>
          </div>

          <VisionCard />
        </div>
      </section>

      {/* A5 — Long-term Objective */}
      <section className="bg-[#EDE4CC] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[860px] mx-auto">
          <SectionLabel>LONG-TERM OBJECTIVE</SectionLabel>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[44px] font-bold text-[#1A2A4A] leading-tight mb-6">
            What we are working toward
          </h2>
          <div className="space-y-5 text-[#3D3520] text-lg leading-[1.8]">
            <p>
              KalyanSetu is not being built as a one-time charity drive. The long-term goal is a
              sustainable, scalable system that operates on a for-profit social impact model — where
              quality, hygiene, and affordability are non-negotiable, and where the business grows
              without compromising its core promise.
            </p>
            <p>
              The objective is to expand across communities, establish trusted food access points,
              and demonstrate that doing good and doing business are not in conflict.
            </p>
          </div>

          {/* A6 — CTA to Founder page */}
          <div className="mt-12 text-center">
            <Link
              to="/founder"
              className="inline-block px-9 py-3.5 bg-[#C9A227] text-white font-bold rounded-[4px] hover:bg-[#b38f20] hover:shadow-md transition-all whitespace-nowrap"
            >
              Meet the Founder
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
