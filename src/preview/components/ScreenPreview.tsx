import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
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
    <div className="grid lg:grid-cols-2 gap-12 lg:items-center">
      {/* Left side - Description */}
      <div className="space-y-6 order-2 lg:order-1">
        <div className="space-y-4">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 px-3 py-1">
            {screen.id.toUpperCase()}
          </Badge>
          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {screen.title}
          </h3>
          <p className="text-lg text-slate-400 leading-relaxed">
            {screen.description}
          </p>
        </div>

        <div className="grid gap-3 pt-4">
          {screen.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-green-400/10">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-slate-300 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Screenshot mockup with Browser Frame */}
      <div key={`${screen.id}-mockup`} className="order-1 lg:order-2 w-full">
        <div className="relative group">
          {/* Animated Glow effect */}
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 transition duration-1000 group-hover:opacity-40" />

          {/* Browser Frame */}
          <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-slate-800/80 border-b border-slate-700/50 px-4 py-1 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 bg-slate-950/50 rounded-md py-1 px-3 text-[10px] text-slate-500 text-center font-mono truncate">
                {window.location.hostname}/{screen.id}
              </div>
            </div>

            {/* Content Area - Fixed height on mobile to prevent "getting lost" */}
            <div className="h-[400px] md:h-[450px] lg:h-[500px] overflow-y-auto overflow-x-auto no-scrollbar bg-background">
              <div className="w-full min-w-[280px]">{renderPreview()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
