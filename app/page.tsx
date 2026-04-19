import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { ProblemSolutionSection } from "@/components/landing/problem-solution-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { LandingTracker } from "@/components/landing/landing-tracker";
import { ScrollProgress } from "@/components/landing/scroll-progress";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ScrollProgress />
      <LandingTracker />
      <Navbar />
      <main>
        <HeroSection />
        <UseCasesSection />
        <ProblemSolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
