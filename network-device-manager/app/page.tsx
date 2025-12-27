import { LandingHero } from "@/components/landing-hero";
import { BentoFeatures } from "@/components/bento-features";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      <LandingHero />
      <div className="container mx-auto px-4 py-24">
        <BentoFeatures />
      </div>
    </main>
  );
}
