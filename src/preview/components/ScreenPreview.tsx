import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { ScrollReveal } from "../../components/ScrollReveal";
import {
  AccountsPreview,
  BillsPreview,
  CategoriesPreview,
  DashboardPreview,
  TransactionsPreview,
} from "./previews";

interface ScreenPreviewProps {
  screen: {
    id: string;
    title: string;
    description: string;
    features: string[];
  };
}

export function ScreenPreview({ screen }: ScreenPreviewProps) {
  const renderPreview = () => {
    switch (screen.id) {
      case "dashboard":
        return <DashboardPreview />;
      case "transactions":
        return <TransactionsPreview />;
      case "bills":
        return <BillsPreview />;
      case "categories":
        return <CategoriesPreview />;
      case "accounts":
        return <AccountsPreview />;
      default:
        return null;
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 lg:items-center">
      {/* Left side - Description */}
      <div className="space-y-6 order-2 lg:order-1">
        {/* Badge and content with scroll reveal */}
        <ScrollReveal direction="left" className="space-y-4">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1 transition-all duration-300 hover:scale-110">
            {screen.id.toUpperCase()}
          </Badge>
          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {screen.title}
          </h3>
          <p className="text-lg text-slate-400 leading-relaxed">
            {screen.description}
          </p>
        </ScrollReveal>

        {/* Features with scroll reveal */}
        <div className="grid gap-3 pt-4">
          {screen.features.map((feature, index) => (
            <ScrollReveal
              key={index}
              direction="left"
              delay={index * 0.1}
              className="flex items-center gap-3 group hover:translate-x-2 transition-transform"
            >
              <div className="p-1 rounded-full bg-green-400/10 group-hover:bg-green-400/20 transition-colors duration-300 group-hover:scale-110">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-slate-300 font-medium">{feature}</span>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Right side - Screenshot mockup with Browser Frame */}
      <ScrollReveal
        key={`${screen.id}-mockup`}
        direction="right"
        delay={0.2}
        className="order-1 lg:order-2 w-full max-w-2xl mx-auto lg:max-w-none"
      >
        <div className="relative group">
          {/* Enhanced animated glow effect */}
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl blur-md opacity-10 transition-all duration-500 group-hover:opacity-30 group-hover:blur-lg" />

          {/* Browser Frame with hover lift effect */}
          <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
            {/* Toolbar */}
            <div className="bg-slate-800/80 border-b border-slate-700/50 px-4 py-1 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 transition-all duration-300 group-hover:bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 transition-all duration-300 group-hover:bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 transition-all duration-300 group-hover:bg-green-500" />
              </div>
              <div className="flex-1 bg-slate-950/50 rounded-md py-1 px-3 text-[10px] text-slate-500 text-center font-mono truncate">
                {window.location.hostname}/{screen.id}
              </div>
            </div>

            {/* Content Area - Fixed height on mobile to prevent "getting lost" */}
            <div className="h-72 sm:h-80 md:h-112 lg:h-125 overflow-y-auto overflow-x-auto no-scrollbar bg-background scroll-smooth">
              <div className="w-full">{renderPreview()}</div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
