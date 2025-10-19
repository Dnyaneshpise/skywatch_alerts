'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radar, Bell, History, MapPin, Settings, Mail, ArrowLeft, Zap, Users, Globe } from 'lucide-react';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Radar,
      title: 'Live Flight Tracking',
      description: 'View real-time aircraft positions with detailed flight information including altitude, speed, and heading.',
      delay: '100'
    },
    {
      icon: Bell,
      title: 'Smart Proximity Alerts',
      description: 'Receive email notifications when aircraft enter your specified radius, with customizable lead times before arrival.',
      delay: '200'
    },
    {
      icon: History,
      title: 'Flight History',
      description: 'Explore historical flight paths and analyze patterns with our "Flight Archaeology" feature.',
      delay: '300'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Track flights worldwide with comprehensive global coverage and real-time data updates.',
      delay: '400'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      icon: MapPin,
      title: 'Set your location',
      description: 'Allow browser geolocation or enter coordinates manually',
      delay: '500'
    },
    {
      step: 2,
      icon: Settings,
      title: 'Configure alerts',
      description: 'Specify distance, aircraft types, and notification preferences',
      delay: '600'
    },
    {
      step: 3,
      icon: Mail,
      title: 'Receive notifications',
      description: 'Get email alerts when matching flights approach your area',
      delay: '700'
    }
  ];

  return (
    <main className="container mx-auto py-8 px-4 relative z-10">
      {/* Hero Section */}
      <div className={`max-w-4xl mx-auto text-center mb-12 transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          About SkyWatch Alerts
        </h1>
        <p className="text-xl text-slate-300 leading-relaxed">
          Revolutionizing airspace awareness with real-time flight tracking and intelligent proximity alerts
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Mission Section */}
        <div className={`bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 mb-12 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center mb-6">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Zap className="h-6 w-6 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white ml-4">Our Mission</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                SkyWatch Alerts revolutionizes airspace awareness by providing real-time flight tracking 
                and intelligent proximity alerts, keeping you informed about aircraft movements in your vicinity.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                Whether you're an aviation enthusiast, professional, or simply curious about air traffic, 
                our platform delivers accurate, timely information right to your fingertips.
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-cyan-400 mr-2" />
                <h3 className="text-xl font-semibold text-white">Who Uses SkyWatch?</h3>
              </div>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Aviation Enthusiasts
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Professional Pilots
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Air Traffic Controllers
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                  Airport Operations
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 transition-all duration-700 transform hover:scale-105 hover:border-cyan-500/30 group ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: isVisible ? `${feature.delay}ms` : '0ms'
                }}
              >
                <div className="flex items-start mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white ml-4">{feature.title}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step, index) => (
              <div
                key={step.step}
                className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 text-center transition-all duration-700 transform hover:scale-105 hover:border-cyan-500/30 group ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: isVisible ? `${step.delay}ms` : '0ms'
                }}
              >
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="p-4 bg-cyan-500/10 rounded-full group-hover:bg-cyan-500/20 transition-colors duration-300">
                      <step.icon className="h-8 w-8 text-cyan-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Start Tracking?
            </h2>
            <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of aviation enthusiasts and professionals who trust SkyWatch Alerts 
              for their flight tracking needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Radar className="h-5 w-5 mr-2" />
                View Live Radar
              </Link>
              <Link 
                href="/alerts" 
                className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 border border-slate-600"
              >
                <Bell className="h-5 w-5 mr-2" />
                Set Up Alerts
              </Link>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className={`text-center mt-8 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 rounded-lg font-medium border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Live Radar
          </Link>
        </div>
      </div>
    </main>
  );
}