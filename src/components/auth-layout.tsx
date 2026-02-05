'use client'

import Link from "next/link";
import { ReactNode } from "react";
import {
  WifiOff,
  Search,
  DoorOpen,
  UserCheck,
  UserPlus,
  CreditCard,
  Users,
  RefreshCw,
  BarChart3,
  Shield,
  Zap,
  LayoutGrid,
} from "lucide-react";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const features = [
    {
      icon: <WifiOff className="h-5 w-5" />,
      title: "Offline-First Operation",
      description: "Fully functional without internet. Local storage with automatic sync when online. Zero downtime during network failures.",
    },
    {
      icon: <DoorOpen className="h-5 w-5" />,
      title: "Entry Footfall Tracking",
      description: "Log every gate entry separately. Track total footfall in real time with append-only logs.",
    },
    {
      icon: <UserCheck className="h-5 w-5" />,
      title: "Event-Wise Attendance",
      description: "Mark attendance per event. Prevent duplicates. Track event footfall accurately.",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Payment Verification",
      description: "View payment status per participant. Event-wise validation. Team and individual support.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm dark:bg-black/[0.6] border-border/40">
        <div className="container h-14 flex items-center">
          <Link
            href="/"
            className="flex justify-start items-center hover:opacity-85 transition-opacity duration-300 gap-1"
          >
            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
            <span className="font-bold">
              <span className="text-secondary">Hackerz</span>
              <span className="text-foreground"> GatePass</span>
            </span>
            <span className="sr-only">Hackerz GatePass</span>
          </Link>
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 flex-1">
        {/* Left side - Features */}
        <div className="relative flex flex-col justify-center overflow-hidden md:order-first order-last">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-accent animate-gradient-x" />
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.6))] -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-white/5 blur-xl" />

          <div className="max-w-xl mx-auto relative z-10 p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Event POS & Footfall</h1>
            <p className="text-lg mb-6 opacity-95 font-medium">
              A reliable, offline-first POS system designed for fast event entry, accurate attendance, and seamless participant management — even without internet.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 backdrop-blur-sm bg-white/10 p-3 rounded-lg transition-all duration-300 hover:bg-white/20"
                >
                  <div className="shrink-0 bg-white/20 p-2 rounded-full mt-0.5">
                    {feature.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm opacity-85">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-8 lg:p-12 md:order-last order-first">
          {children}
        </div>
      </main>
      <footer className="py-6 md:py-0 border-t border-border/40">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <span className="text-sm text-foreground">
            &copy; {new Date().getFullYear()} Hackerz. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
