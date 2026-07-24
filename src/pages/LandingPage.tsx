import React, { lazy, Suspense } from 'react';
import HeroSection from '../sections/Hero/HeroSection';

const StatisticsSection = lazy(() => import('../sections/Statistics/StatisticsSection'));
const USPCardsSection = lazy(() => import('../sections/USPCards/USPCardsSection'));
const ServicesSection = lazy(() => import('../sections/Services/ServicesSection'));
const WhyChooseUsSection = lazy(() => import('../sections/WhyChooseUs/WhyChooseUsSection'));
const AnalyticsSection = lazy(() => import('../sections/Analytics/AnalyticsSection'));
const FeaturesSection = lazy(() => import('../sections/Features/FeaturesSection'));
const GSTNewsSection = lazy(() => import('../sections/GSTNews/GSTNewsSection'));
const CTASection = lazy(() => import('../sections/CTA/CTASection'));

export default function LandingPage() {
  return (
    <main role="main">
      <HeroSection />
      <Suspense fallback={<div className="h-32 bg-[#0D0D0F]" aria-hidden="true" />}>
        <StatisticsSection />
        <USPCardsSection />
        <ServicesSection />
        <WhyChooseUsSection />
        <GSTNewsSection />
        <FeaturesSection />
        <AnalyticsSection />
        <CTASection />
      </Suspense>
    </main>
  );
}
