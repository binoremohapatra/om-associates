import React from 'react';
import HeroSection from '../sections/Hero/HeroSection';
import StatisticsSection from '../sections/Statistics/StatisticsSection';
import USPCardsSection from '../sections/USPCards/USPCardsSection';
import ServicesSection from '../sections/Services/ServicesSection';
import WhyChooseUsSection from '../sections/WhyChooseUs/WhyChooseUsSection';
import AnalyticsSection from '../sections/Analytics/AnalyticsSection';
import FeaturesSection from '../sections/Features/FeaturesSection';
import GSTNewsSection from '../sections/GSTNews/GSTNewsSection';
import CTASection from '../sections/CTA/CTASection';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatisticsSection />
      <USPCardsSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <GSTNewsSection />
      <FeaturesSection />
      <AnalyticsSection />
      <CTASection />
    </>
  );
}
