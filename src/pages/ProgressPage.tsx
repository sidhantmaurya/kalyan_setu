import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RefreshCw, Clock, Target } from 'lucide-react';
import { SectionLabel, MilestoneRow } from '../components/ReusableBlocks';
import {
  COMPLETED_MILESTONES,
  REMAINING_MILESTONES,
  PROGRESS_TIMELINE,
} from '../data/kalyansetuData';

export function ProgressPage() {
  return (
    <div>
      {/* PR1 — Page Hero (navy background) */}
      <section className="bg-navy-luxury text-white py-20 md:py-28 px-4 sm:px-6 text-center border-b-2 border-[#C9A227]">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel centered>TRANSPARENT MILESTONES</SectionLabel>
          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Where We Stand Today
          </h1>
          <p className="font-garamond italic text-2xl sm:text-3xl text-[#E8C96A]">
            We&apos;re early. We&apos;re honest. We&apos;re moving.
          </p>
        </div>
      </section>

      {/* PR2 — Honest Stage Statement */}
      <section className="bg-[#F5EFE0] py-14 md:py-16 px-4 sm:px-6 text-center border-b border-[#C9A227]/30">
        <div className="max-w-[800px] mx-auto">
          <p className="text-[#3D3520] text-lg leading-[1.8]">
            KalyanSetu is an early-stage initiative. The founder is a student, building this from
            the ground up with honesty and purpose. Below is an exact, transparent account of what
            has been done and what still lies ahead.
          </p>
        </div>
      </section>

      {/* PR5 — Progress Visual Timeline */}
      <section className="bg-[#EDE4CC] py-14 md:py-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <SectionLabel centered>JOURNEY ROADMAP</SectionLabel>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1A2A4A] text-center mb-10">
            From Idea to Pilot Launch
          </h2>

          <div className="relative">
            {/* Horizontal connecting bar on desktop */}
            <div
              className="hidden lg:block absolute top-6 left-8 right-8 h-1 bg-[#1A2A4A]/20 rounded"
              aria-hidden="true"
            >
              <div className="h-full w-1/3 bg-[#C9A227] rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
              {PROGRESS_TIMELINE.map((step, index) => {
                const isDone = step.state === 'done';
                const isActive = step.state === 'active';
                const isGoal = step.state === 'goal';

                return (
                  <div
                    key={step.label}
                    className="flex flex-col items-center text-center bg-[#F5EFE0] lg:bg-transparent p-4 lg:p-0 rounded-xl border border-[#C9A227]/30 lg:border-0"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-3 shadow-xs ${
                        isDone
                          ? 'bg-[#C9A227] border-[#C9A227] text-white'
                          : isActive
                            ? 'bg-[#1A2A4A] border-[#C9A227] text-[#E8C96A] ring-4 ring-[#C9A227]/30'
                            : isGoal
                              ? 'bg-[#F5EFE0] border-[#1A2A4A] text-[#1A2A4A]'
                              : 'bg-[#F5EFE0] border-[#7A6A50]/50 text-[#7A6A50]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isActive ? (
                        <RefreshCw className="w-5 h-5" />
                      ) : isGoal ? (
                        <Target className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7A6A50] tabular-nums">
                      Step 0{index + 1} · {step.statusText}
                    </span>
                    <h3 className="font-serif-heading text-lg font-bold text-[#1A2A4A] mt-1">
                      {step.label}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* PR3 & PR4 — Completed Milestones + What Remains */}
      <section className="bg-[#F5EFE0] py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* PR3 — Completed Milestones */}
          <div>
            <SectionLabel>WHAT&apos;S BEEN DONE</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1A2A4A] mb-8">
              Progress so far.
            </h2>
            <div className="space-y-4">
              {COMPLETED_MILESTONES.map((item) => (
                <MilestoneRow
                  key={item.title}
                  status="done"
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>

          {/* PR4 — What Remains */}
          <div>
            <SectionLabel variant="navy">WHAT COMES NEXT</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1A2A4A] mb-8">
              The road ahead.
            </h2>
            <div className="space-y-4">
              {REMAINING_MILESTONES.map((item) => (
                <MilestoneRow
                  key={item.title}
                  status="pending"
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PR6 — Transparency Statement */}
      <section className="bg-[#1A2A4A] text-white py-14 px-4 sm:px-6 text-center">
        <div className="max-w-[800px] mx-auto">
          <p className="font-garamond italic text-2xl sm:text-[26px] text-white leading-relaxed">
            &ldquo;We believe in building in public. This page will be updated as we grow.&rdquo;
          </p>
          <p className="text-xs uppercase tracking-[2px] text-[#C9A227] mt-3">
            Last updated: October 2026
          </p>
        </div>
      </section>

      {/* PR7 — CTA */}
      <section className="bg-[#EDE4CC] py-14 md:py-16 px-4 sm:px-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/contact"
            className="px-9 py-3.5 bg-[#C9A227] text-white font-bold rounded-[4px] hover:bg-[#b38f20] hover:shadow-md transition-all whitespace-nowrap"
          >
            Support Our Journey
          </Link>
          <Link
            to="/founder"
            className="px-9 py-3.5 bg-transparent border-2 border-[#1A2A4A] text-[#1A2A4A] font-bold rounded-[4px] hover:bg-[#1A2A4A] hover:text-white transition-all whitespace-nowrap"
          >
            Meet the Founder
          </Link>
        </div>
      </section>
    </div>
  );
}
