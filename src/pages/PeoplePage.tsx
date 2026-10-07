import React from 'react';
import { Link } from 'react-router-dom';
import { SectionLabel, NumberedCard } from '../components/ReusableBlocks';
import { WHO_WE_SERVE_CATEGORIES } from '../data/kalyansetuData';

export function PeoplePage() {
  return (
    <div>
      {/* P1 — Page Hero (navy background) */}
      <section className="bg-navy-luxury text-white py-20 md:py-28 px-4 sm:px-6 text-center border-b-2 border-[#C9A227]">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel centered>COMMUNITIES WE SERVE</SectionLabel>
          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Who Kalyan Setu Is For
          </h1>
          <p className="font-garamond italic text-2xl sm:text-3xl text-[#E8C96A]">
            Different lives, same need — good food.
          </p>
        </div>
      </section>

      {/* P2 — Introduction */}
      <section className="bg-[#F5EFE0] pt-16 pb-8 px-4 sm:px-6 text-center">
        <div className="max-w-[800px] mx-auto">
          <SectionLabel centered>COMMUNITIES WE SERVE</SectionLabel>
          <p className="text-[#3D3520] text-lg leading-[1.8]">
            We are building for those who keep life moving. Across India, millions of people spend
            their days away from home — in colleges, on construction sites, behind steering wheels,
            in factories. They deserve nourishing, affordable meals just as much as anyone else.
          </p>
        </div>
      </section>

      {/* P3 — 6 Numbered Cards (expanded with story paragraphs) */}
      <section className="bg-[#F5EFE0] py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {WHO_WE_SERVE_CATEGORIES.map((cat) => (
            <NumberedCard
              key={cat.number}
              number={cat.number}
              title={cat.title}
              description={cat.description}
              extendedStory={cat.extendedStory}
            />
          ))}
        </div>
      </section>

      {/* P4 — CTA */}
      <section className="bg-[#1A2A4A] text-white py-16 px-4 sm:px-6 text-center">
        <div className="max-w-[820px] mx-auto">
          <p className="font-garamond italic text-2xl sm:text-3xl text-[#E8C96A] mb-8">
            &ldquo;If you belong here — or know someone who does — Kalyan Setu is being built for
            you.&rdquo;
          </p>
          <Link
            to="/contact"
            className="inline-block px-9 py-3.5 bg-[#C9A227] text-white font-bold rounded-[4px] hover:bg-[#b38f20] hover:shadow-md transition-all whitespace-nowrap"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
