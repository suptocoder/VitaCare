"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'; // For App Router (new style)
import Link from "next/link";
import HeroSection from '@/components/ui/herosectiohomepage';
import Featuresection from '@/components/featuresection';
function Home() {
  return (
    <>
    <HeroSection/>
    <Featuresection/>
    </>
  );
}

export default Home 
