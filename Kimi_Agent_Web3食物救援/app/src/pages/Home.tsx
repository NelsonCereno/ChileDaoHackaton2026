import { useEffect } from 'react';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import VideoShowcase from '@/sections/VideoShowcase';
import CrossChainMarquee from '@/sections/CrossChainMarquee';
import VoiceInterface from '@/sections/VoiceInterface';
import CrossChainPayment from '@/sections/CrossChainPayment';
import FoodGallery from '@/sections/FoodGallery';
import RobotSimulation from '@/sections/RobotSimulation';
import Stats from '@/sections/Stats';
import Footer from '@/sections/Footer';

export default function Home() {
  useEffect(() => {
    // Smooth scroll for anchor links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const id = anchor.getAttribute('href')?.slice(1);
        if (id) {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#03045E]">
      <Navigation />
      <Hero />
      <VideoShowcase />
      <CrossChainMarquee />
      <VoiceInterface />
      <CrossChainPayment />
      <FoodGallery />
      <RobotSimulation />
      <Stats />
      <Footer />
    </div>
  );
}
