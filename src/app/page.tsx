import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Camera,
  Command,
  Cpu,
  Flame,
  HardHat,
  LayoutDashboard,
  MapPinned,
  Radio,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Vertise — Construction Site Safety Monitoring" },
  description:
    "Real-time hazard detection for construction sites, powered by ESP32 camera nodes and on-device edge AI.",
};

const stats = [
  { value: "< 200 ms", label: "On-device inference per frame" },
  { value: "24/7", label: "Continuous site monitoring" },
  { value: "10+", label: "Hazard classes detected" },
  { value: "Edge-first", label: "Raw video stays on site" },
];

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: HardHat,
    title: "PPE compliance",
    description:
      "Detect missing hard hats, hi-vis vests, gloves and harnesses the moment a worker enters frame.",
  },
  {
    icon: MapPinned,
    title: "Zone & perimeter breaches",
    description:
      "Flag unauthorized entry into exclusion zones, open edges and restricted areas on a live site map.",
  },
  {
    icon: TriangleAlert,
    title: "Machinery near-misses",
    description:
      "Catch workers stepping into the swing radius of excavators, cranes and moving plant before contact.",
  },
  {
    icon: Flame,
    title: "Fire & smoke",
    description:
      "Early visual detection of smoke and open flame, escalated instantly to the site safety officer.",
  },
  {
    icon: BellRing,
    title: "Real-time alerts",
    description:
      "Severity-ranked incidents with snapshot evidence, response tracking and a full audit log.",
  },
  {
    icon: BarChart3,
    title: "Workforce & trend analytics",
    description:
      "Compliance trends, high-risk hours, repeat violations by crew — the data you need for toolbox talks.",
  },
];

const hazards = [
  { src: "/snapshots/no-harness.svg", label: "No harness" },
  { src: "/snapshots/open-edge.svg", label: "Open edge" },
  { src: "/snapshots/falling-object.svg", label: "Falling object" },
  { src: "/snapshots/fire-smoke.svg", label: "Fire / smoke" },
  { src: "/snapshots/machinery-near-miss.svg", label: "Machinery near-miss" },
  { src: "/snapshots/no-hi-vis.svg", label: "No hi-vis" },
  { src: "/snapshots/trip-hazard.svg", label: "Trip hazard" },
  { src: "/snapshots/poor-housekeeping.svg", label: "Poor housekeeping" },
];

const steps: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Camera,
    title: "Capture",
    description:
      "Low-cost ESP32 camera nodes are mounted around the site or worn on hard hats, capturing frames continuously.",
  },
  {
    icon: Cpu,
    title: "Detect at the edge",
    description:
      "A compact AI model runs on-device to classify hazards in milliseconds — no cloud round-trip, no bandwidth bottleneck.",
  },
  {
    icon: Radio,
    title: "Alert & analyze",
    description:
      "Only detection events and snapshots are sent to the dashboard, where alerts, maps and trends update live.",
  },
];

function DashboardLink({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base", className)}>
      {children ?? (
        <>
          Go to Dashboard
          <ArrowRight data-icon="inline-end" />
        </>
      )}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-base">
            <Command className="size-5" />
            Vertise
          </Link>
          <nav className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#hazards" className="transition-colors hover:text-foreground">
              Hazards
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeModeToggle />
            <Link href="/dashboard" className={cn(buttonVariants({ size: "default" }), "ml-1")}>
              <LayoutDashboard data-icon="inline-start" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--color-amber-500)_15%,transparent),transparent_60%)]"
          />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
            <div className="flex flex-col items-start gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 font-medium text-xs">
                <Cpu className="size-3.5 text-amber-500" />
                ESP32 + Edge AI hazard detection
              </span>
              <h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                See hazards before they become incidents.
              </h1>
              <p className="max-w-xl text-pretty text-lg text-muted-foreground">
                Vertise turns low-cost ESP32 cameras into an always-on safety officer. An AI model running directly on
                the device spots missing PPE, zone breaches and near-misses in real time — and your team gets the alert
                in seconds.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <DashboardLink />
                <a
                  href="#how-it-works"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5 text-base")}
                >
                  How it works
                </a>
              </div>
            </div>

            {/* Mock live detection card */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-xl ring-1 ring-foreground/5">
                <div className="flex items-center justify-between border-b px-4 py-2.5 text-xs">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75 motion-reduce:animate-none" />
                      <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                    </span>
                    LIVE · Node ESP32-07 · Zone B
                  </span>
                  <span className="font-mono text-muted-foreground tabular-nums">12 fps</span>
                </div>
                <div className="relative aspect-4/3">
                  <Image
                    src="/snapshots/no-hard-hat.svg"
                    alt="Camera frame showing a worker without a hard hat"
                    fill
                    priority
                    sizes="(min-width: 1024px) 32rem, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute top-[22%] left-[38%] h-[52%] w-[24%] rounded-sm border-2 border-red-500">
                    <span className="absolute -top-6 left-[-2px] whitespace-nowrap rounded-sm bg-red-500 px-1.5 py-0.5 font-mono text-[10px] text-white">
                      no_hard_hat 0.94
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">PPE violation detected</p>
                    <p className="text-muted-foreground text-xs">Alert sent to site supervisor · 0.4 s ago</p>
                  </div>
                  <span className="rounded-full bg-red-500/10 px-2.5 py-1 font-medium text-red-600 text-xs dark:text-red-400">
                    High
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/40">
          <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="order-2 text-muted-foreground text-sm">{stat.label}</dt>
                <dd className="order-1 font-semibold text-2xl tracking-tight sm:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-semibold text-3xl tracking-tight">Everything a safety officer watches for</h2>
            <p className="mt-3 text-muted-foreground">
              One system for detection, alerting and reporting — so incidents are prevented, not just documented.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/40">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-1.5 text-muted-foreground text-sm">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Hazard gallery */}
        <section id="hazards" className="scroll-mt-20 border-y bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="font-semibold text-3xl tracking-tight">Trained on real site hazards</h2>
              <p className="mt-3 text-muted-foreground">
                Every detection is saved with a snapshot, so supervisors can verify, coach and close out incidents.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {hazards.map((hazard) => (
                <figure key={hazard.src} className="overflow-hidden rounded-xl border bg-card">
                  <div className="relative aspect-4/3">
                    <Image
                      src={hazard.src}
                      alt={`Example detection: ${hazard.label}`}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-3 py-2 font-medium text-sm">{hazard.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-semibold text-3xl tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Processing happens where the footage is captured. That keeps latency low, bandwidth small and raw video
              off the internet.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, i) => (
              <li key={title} className="relative rounded-xl border bg-card p-6">
                <span className="font-mono text-muted-foreground text-xs">0{i + 1}</span>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-medium text-lg">{title}</h3>
                </div>
                <p className="mt-3 text-muted-foreground text-sm">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border bg-card p-8 md:flex-row md:items-center md:p-12">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 size-8 shrink-0 text-amber-500" />
              <div>
                <h2 className="font-semibold text-2xl tracking-tight">Ready to monitor your site?</h2>
                <p className="mt-2 text-muted-foreground">
                  Open the dashboard to see live alerts, hazard maps and workforce compliance.
                </p>
              </div>
            </div>
            <DashboardLink className="shrink-0" />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-muted-foreground text-sm sm:flex-row sm:px-6">
          <span className="flex items-center gap-2">
            <Command className="size-4" />
            Vertise · Construction site safety monitoring
          </span>
          <span>© {new Date().getFullYear()} Vertise</span>
        </div>
      </footer>
    </div>
  );
}
