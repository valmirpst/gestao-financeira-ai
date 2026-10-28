import { CallToActionSection } from "./components/CallToActionSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { PreviewFooter } from "./components/PreviewFooter";
import { PreviewHeader } from "./components/PreviewHeader";

export function PreviewPage() {
  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900">
      <PreviewHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CallToActionSection />
      </main>
      <PreviewFooter />
    </div>
  );
}
