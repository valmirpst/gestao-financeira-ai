import { FeaturesSection, HeroSection, ScreenShowcase } from "./components";

export function PreviewPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      <HeroSection />
      <ScreenShowcase />
      <FeaturesSection />
    </div>
  );
}
