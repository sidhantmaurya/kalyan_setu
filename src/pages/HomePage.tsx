import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  IndianRupee,
  MapPin,
  Heart,
  Utensils,
  ShieldCheck,
  Users,
  Soup,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  BotanicalLeafSvg,
  MountainWaveSvg,
  HERO_IMAGE_PATH,
  ResilientImage,
  KalyanSetuLogo,
} from '../components/BrandVisuals';
import {
  SectionLabel,
  NumberedCard,
  PillarCard,
  MilestoneRow,
  GoldBlockquote,
  FounderAvatarBlock,
  StepFlow,
} from '../components/ReusableBlocks';
import {
  WHO_WE_SERVE_CATEGORIES,
  COMPLETED_MILESTONES,
  REMAINING_MILESTONES,
} from '../data/kalyansetuData';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user, openLoginModal } = useAuth();

  return (
    <div>
      {/* SECTION H1 — HERO */}
      <section className="relative min-h-[calc(100vh-112px)] flex flex-col justify-between bg-cream-luxury overflow-hidden pt-8 md:pt-14">
        <BotanicalLeafSvg className="w-48 h-48 md:w-72 md:h-72 absolute top-0 right-0 pointer-events-none opacity-80" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full my-auto py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left 55% (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE4CC] border border-[#C9A227]/60 text-[#1A2A4A] text-xs font-bold uppercase tracking-[2px] mb-5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>SERVING NOURISHMENT · BUILDING CONNECTION</span>
              </div>

              <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-[62px] font-bold text-[#1A2A4A] leading-[1.1] mb-6">
                Food is not just fuel.
                <br />
                It&apos;s{' '}
                <span className="italic font-garamond text-[#C9A227] font-semibold">
                  dignity, energy
                </span>
                <br />
                and hope.
              </h1>

              <p className="text-[#3D3520] text-lg leading-[1.85] max-w-xl mb-5">
                Every day, millions of people — students, workers, drivers, and many others — spend
                long hours away from home. Finding a simple, healthy and affordable meal should not
                be this hard.
              </p>

              <p className="font-garamond italic text-2xl sm:text-[26px] text-[#C9A227] font-semibold mb-8 border-l-2 border-[#C9A227] pl-4">
                &ldquo;Good food should not be a luxury.&rdquo;
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A227] text-white font-bold rounded-lg hover:bg-[#b38f20] shadow-luxury transition-all hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
                >
                  <span>Our Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/progress"
                  className="px-8 py-4 bg-transparent border-2 border-[#1A2A4A] text-[#1A2A4A] font-bold rounded-lg hover:bg-[#1A2A4A] hover:text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
                >
                  See Progress
                </Link>
                {!user && (
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="px-6 py-4 bg-[#EDE4CC] hover:bg-[#e5d8b8] border border-[#C9A227] text-[#1A2A4A] font-bold text-sm rounded-lg transition-all cursor-pointer"
                  >
                    Member Sign-In
                  </button>
                )}
              </div>
            </div>

            {/* Right 45% (5 cols) — Architectural Double-Framed Image */}
            <div className="lg:col-span-5 relative">
              {/* Architectural Gold Offset Wireframe */}
              <div
                className="hidden sm:block absolute inset-0 translate-x-3.5 translate-y-3.5 rounded-2xl border-2 border-[#C9A227]/60 pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative border-[3px] border-[#C9A227] rounded-2xl overflow-hidden shadow-luxury-lg bg-[#EDE4CC]">
                <ResilientImage
                  src={HERO_IMAGE_PATH}
                  alt="Hands serving a warm, freshly prepared Indian thali with rice, dal, and sabzi at a community dining table"
                  eager={true}
                  className="w-full aspect-4/3 object-cover"
                />
                {/* Top-right Quality Pill Overlay */}
                <div className="absolute top-3.5 right-3.5 bg-[#1A2A4A]/90 backdrop-blur-xs border border-[#C9A227] text-[#E8C96A] px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-md">
                  1-Grade Quality · Minimum Cost
                </div>
              </div>

              {/* Floating badge bottom-left overlapping */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 bg-[#F5EFE0] border-2 border-[#C9A227] rounded-xl px-5 py-4 shadow-luxury max-w-xs flex items-center gap-3.5 z-10">
                <div className="shrink-0">
                  <KalyanSetuLogo variant="navy" size="sm" />
                </div>
                <p className="text-xs font-bold text-[#1A2A4A] leading-snug border-l-2 border-[#C9A227]/50 pl-3">
                  &ldquo;Real Food. Real People. A Stronger Tomorrow.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Architectural Pillars Ribbon */}
          <div className="mt-16 pt-8 border-t border-[#C9A227]/35 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <span className="font-serif-heading text-xl font-bold text-[#C9A227] tabular-nums">
                01
              </span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#1A2A4A]">
                  Dignified Nourishment
                </h2>
                <p className="text-sm text-[#7A6A50] mt-0.5">
                  Fresh, hygienic meals served with respect for every walk of life.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="font-serif-heading text-xl font-bold text-[#C9A227] tabular-nums">
                02
              </span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#1A2A4A]">
                  Sustainable System
                </h2>
                <p className="text-sm text-[#7A6A50] mt-0.5">
                  For-profit social impact built to scale reliably beyond one-time charity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="font-serif-heading text-xl font-bold text-[#C9A227] tabular-nums">
                03
              </span>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[2px] text-[#1A2A4A]">
                  Transparent Roadmap
                </h2>
                <p className="text-sm text-[#7A6A50] mt-0.5">
                  12 foundational milestones completed toward our community pilot launch.
                </p>
              </div>
            </div>
          </div>
        </div>

        <MountainWaveSvg fill="#EDE4CC" className="mt-4" />
      </section>

      {/* SECTION H2 — THE PROBLEM */}
      <section className="bg-[#EDE4CC] py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-[920px] mx-auto text-center">
          <SectionLabel centered>THE PROBLEM</SectionLabel>

          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[46px] font-bold text-[#1A2A4A] leading-tight mb-6">
            Millions go hungry not from shortage —
            <br className="hidden sm:inline" /> but from unaffordability.
          </h2>

          <p className="text-[#3D3520] text-lg leading-[1.85] max-w-[760px] mx-auto mb-10">
            For many people, food is not simply a matter of preference or convenience. There are
            people who struggle to afford even a basic, nourishing meal. Students managing tight
            budgets, daily-wage workers, drivers spending all day on the road, and low-income
            families — all face the same invisible barrier: the price of a dignified meal.
          </p>

          <div className="max-w-2xl mx-auto text-left bg-[#F5EFE0] p-7 md:p-9 rounded-2xl border-2 border-[#C9A227]/60 shadow-luxury">
            <GoldBlockquote>
              &ldquo;Because no one should have to go without a nourishing meal simply because they
              cannot afford it.&rdquo;
            </GoldBlockquote>
          </div>
        </div>
      </section>

      {/* SECTION H3 — OUR SOLUTION */}
      <section className="bg-cream-luxury py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 50% */}
          <div className="lg:col-span-6">
            <SectionLabel>OUR SOLUTION</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[46px] font-bold text-[#1A2A4A] leading-tight mb-6">
              A sustainable system —
              <br />
              not just charity.
            </h2>
            <p className="text-[#3D3520] text-[17px] leading-[1.85] mb-5">
              The vision goes beyond providing food at a lower price. It is about making nourishment
              more accessible, maintaining trust and quality, and creating a system that can grow
              sustainably rather than depending only on short-term charity.
            </p>
            <p className="text-[#1A2A4A] text-[18px] leading-[1.8] font-semibold border-l-4 border-[#C9A227] pl-4">
              Kalyan Setu is being built with those people at the centre of its purpose.
            </p>
          </div>

          {/* Right 50% — 4 pillar mini-cards (2x2 grid) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <PillarCard
              icon={<Sprout className="w-6 h-6" />}
              title="NOURISHING"
              description="Real Nutrition. Real Energy."
            />
            <PillarCard
              icon={<IndianRupee className="w-6 h-6" />}
              title="AFFORDABLE"
              description="Good Food. Within Reach."
            />
            <PillarCard
              icon={<MapPin className="w-6 h-6" />}
              title="ACCESSIBLE"
              description="Easy to Find. Easier to Trust."
            />
            <PillarCard
              icon={<Heart className="w-6 h-6" />}
              title="FOR EVERYONE"
              description="Because no one should be left hungry."
            />
          </div>
        </div>
      </section>

      {/* SECTION H4 — WHO WE SERVE */}
      <section className="bg-[#EDE4CC] py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionLabel centered>WHO KALYAN SETU IS FOR</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[46px] font-bold text-[#1A2A4A] leading-tight">
              We are building for those who keep life moving.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {WHO_WE_SERVE_CATEGORIES.map((cat) => (
              <NumberedCard
                key={cat.number}
                number={cat.number}
                title={cat.title}
                description={cat.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION H5 — HOW KALYAN SETU WORKS */}
      <section className="bg-cream-luxury py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionLabel centered>HOW IT WORKS</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[46px] font-bold text-[#1A2A4A] leading-tight">
              Simple. Accessible. Dignified.
            </h2>
          </div>

          <StepFlow
            steps={[
              {
                icon: <Sprout className="w-6 h-6" />,
                title: 'Sourcing Quality Food',
                description: 'We source fresh, nutritious ingredients at minimum cost.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: 'Preparing Hygienically',
                description: 'Every meal is prepared with hygiene and quality standards.',
              },
              {
                icon: <Utensils className="w-6 h-6" />,
                title: 'Serving Affordably',
                description:
                  'Reaching students, workers, and families at prices they can afford.',
              },
            ]}
          />
        </div>
      </section>

      {/* SECTION H6 — MISSION & VISION */}
      <section className="bg-navy-luxury text-white py-20 md:py-28 px-4 sm:px-6 border-y-2 border-[#C9A227]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 items-start">
            {/* Left — OUR MISSION */}
            <div className="md:pr-12">
              <div
                className="w-14 h-14 rounded-full bg-[#C9A227]/15 border-2 border-[#C9A227] text-[#E8C96A] flex items-center justify-center mb-5"
                aria-hidden="true"
              >
                <Soup className="w-6 h-6" />
              </div>
              <SectionLabel>OUR MISSION</SectionLabel>
              <p className="text-white/95 text-lg leading-[1.85]">
                To provide 1-grade quality food at the minimum possible cost and make it accessible
                to everyone, especially the underprivileged.
              </p>
            </div>

            {/* Right — OUR VISION */}
            <div className="md:pl-12 md:border-l md:border-[#C9A227]/60">
              <div
                className="w-14 h-14 rounded-full bg-[#C9A227]/15 border-2 border-[#C9A227] text-[#E8C96A] flex items-center justify-center mb-5"
                aria-hidden="true"
              >
                <Users className="w-6 h-6" />
              </div>
              <SectionLabel>OUR VISION</SectionLabel>
              <p className="text-white/95 text-lg leading-[1.85]">
                To create a society where every individual, regardless of their income, can enjoy a
                healthy, wholesome and dignified meal every day.
              </p>
            </div>
          </div>

          <div className="mt-14 pt-10 border-t border-[#C9A227]/35 text-center">
            <p className="font-garamond italic text-2xl sm:text-3xl text-[#E8C96A] leading-relaxed">
              &ldquo;Nourishment should never be a privilege of income.&rdquo;
            </p>
            <p className="text-sm text-white/80 mt-2 tracking-wider uppercase">
              — Divyansh Rai, Founder
            </p>
          </div>
        </div>
      </section>

      {/* SECTION H7 — CURRENT STAGE (PROGRESS SNAPSHOT) */}
      <section className="bg-[#EDE4CC] py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <SectionLabel centered>WHERE WE STAND TODAY</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[46px] font-bold text-[#1A2A4A] leading-tight mb-4">
              We&apos;re moving — one step at a time.
            </h2>
            <p className="text-[#7A6A50] text-base md:text-lg leading-relaxed">
              KalyanSetu is in its early stage. Here&apos;s exactly how far we&apos;ve come and
              what&apos;s next on our path.
            </p>
          </div>

          {/* Visual Foundation Progress Bar */}
          <div className="max-w-3xl mx-auto mb-12 bg-[#F5EFE0] border border-[#C9A227]/60 rounded-2xl p-6 shadow-luxury">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-[2px] text-[#1A2A4A]">
                Foundation &amp; Pre-Pilot Progress
              </span>
              <span className="text-xs font-bold uppercase tracking-[2px] text-[#C9A227] tabular-nums">
                12 of 22 Milestones Completed (55%)
              </span>
            </div>
            <div className="w-full h-3 bg-[#EDE4CC] rounded-full overflow-hidden border border-[#C9A227]/40">
              <div className="h-full w-[55%] bg-gradient-to-r from-[#1A2A4A] to-[#C9A227] rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column — What's Done */}
            <div>
              <h3 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-5 flex items-center justify-between">
                <span>What&apos;s Done</span>
                <span className="text-xs font-body uppercase tracking-widest text-[#C9A227] tabular-nums">
                  12 Completed
                </span>
              </h3>
              <div className="space-y-3">
                {COMPLETED_MILESTONES.map((item) => (
                  <MilestoneRow key={item.shortTitle} status="done" title={item.shortTitle} />
                ))}
              </div>
            </div>

            {/* Right Column — What Remains */}
            <div>
              <h3 className="font-serif-heading text-2xl font-bold text-[#1A2A4A] mb-5 flex items-center justify-between">
                <span>What Remains</span>
                <span className="text-xs font-body uppercase tracking-widest text-[#7A6A50] tabular-nums">
                  10 Upcoming
                </span>
              </h3>
              <div className="space-y-3">
                {REMAINING_MILESTONES.map((item) => (
                  <MilestoneRow key={item.shortTitle} status="pending" title={item.shortTitle} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION H8 — FOUNDER INTRODUCTION */}
      <section className="bg-cream-luxury py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left 40% (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#EDE4CC] border-2 border-[#C9A227] rounded-2xl p-8 sm:p-10 shadow-luxury">
              <FounderAvatarBlock
                size="md"
                showUniversity={true}
                quote='"Food can do more than just fill your stomach."'
              />
            </div>
          </div>

          {/* Right 60% (7 cols) */}
          <div className="lg:col-span-7">
            <SectionLabel>THE PERSON BEHIND KALYAN SETU</SectionLabel>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[46px] font-bold text-[#1A2A4A] leading-tight mb-6">
              The Person Behind Kalyan Setu
            </h2>
            <p className="text-[#3D3520] text-[17px] leading-[1.85] mb-4">
              Divyansh Rai is the founder of Kalyan Setu, an early-stage initiative built around a
              simple belief: access to nourishing food should not depend entirely on a person&apos;s
              income.
            </p>
            <p className="text-[#3D3520] text-[17px] leading-[1.85] mb-8">
              He completed his 10+2 education and is currently pursuing his graduation at the
              Central University of Kerala. Alongside his academic journey, he is working on
              building Kalyan Setu with a long-term focus on affordable nourishment, dignity and
              sustainable community impact.
            </p>
            <Link
              to="/founder"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#1A2A4A] text-[#1A2A4A] font-bold rounded-lg hover:bg-[#1A2A4A] hover:text-white transition-all whitespace-nowrap"
            >
              <span>Read Full Story</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION H9 — FUNDING CTA */}
      <section id="funding-cta" className="bg-navy-luxury py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-[1020px] mx-auto border-2 border-[#C9A227] rounded-2xl p-8 sm:p-14 text-center relative shadow-luxury-lg bg-[#1A2A4A]/60 backdrop-blur-xs">
          <div
            className="font-serif-heading text-6xl md:text-[72px] leading-none text-[#C9A227] select-none mb-2"
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-[46px] font-bold text-white leading-tight mb-4">
            Help us build the bridge
            <br className="hidden sm:inline" /> to nourishment.
          </h2>
          <p className="font-garamond italic text-xl md:text-2xl text-[#E8C96A] max-w-2xl mx-auto mb-8">
            KalyanSetu is at an early stage. Your support — financial or otherwise — can help us go
            from vision to reality.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <Link
              to="/contact?reason=Investor"
              className="px-9 py-4 bg-[#C9A227] text-white font-bold rounded-lg hover:bg-[#b38f20] shadow-luxury transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              Support Our Mission
            </Link>
            <Link
              to="/contact?reason=Partner+With+Us"
              className="px-9 py-4 bg-transparent border-2 border-[#C9A227] text-[#E8C96A] font-bold rounded-lg hover:bg-[#C9A227] hover:text-[#1A2A4A] transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              Partner With Us
            </Link>
          </div>

          <p className="text-white/85 text-sm">
            If you believe good food is a right, not a luxury — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* SECTION H10 — CONTACT STRIP */}
      <section className="bg-[#EDE4CC] py-20 md:py-24 px-4 sm:px-6 text-center">
        <div className="max-w-[760px] mx-auto">
          <SectionLabel centered>GET IN TOUCH</SectionLabel>
          <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1A2A4A] mb-4">
            Questions? Ideas? Let&apos;s talk.
          </h2>
          <p className="text-[#7A6A50] text-[17px] leading-relaxed mb-8">
            Whether you want to collaborate, partner, invest, or simply learn more — we&apos;re open
            to every conversation.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-9 py-4 bg-[#C9A227] text-white font-bold rounded-lg hover:bg-[#b38f20] shadow-luxury transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
