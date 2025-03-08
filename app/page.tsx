"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Scale, Users, Search, MessageSquare, BookOpen } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-primary mr-2" />
          <h1 className="text-4xl font-bold">CyberLegalExperts</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Navigate the complex world of cybersecurity law with expert guidance. Connect with verified legal professionals and stay compliant across borders.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => router.push('/experts')}>Find an Expert</Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/knowledge')}>Learn More</Button>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Search className="h-8 w-8" />}
            title="Cyber Law Database"
            description="Search and understand cybersecurity laws across different countries with our comprehensive database."
            onClick={() => router.push('/laws')}
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Expert Directory"
            description="Connect with verified cybersecurity law professionals. Read reviews and ratings from clients."
            onClick={() => router.push('/experts')}
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8" />}
            title="AI-Powered Matching"
            description="Our intelligent system matches you with the perfect expert based on your specific needs and location."
            onClick={() => router.push('/chat')}
          />
          <FeatureCard
            icon={<BookOpen className="h-8 w-8" />}
            title="Knowledge Hub"
            description="Access the latest updates, case studies, and compliance guides in cybersecurity law."
            onClick={() => router.push('/knowledge')}
          />
          <FeatureCard
            icon={<Scale className="h-8 w-8" />}
            title="Compliance Tools"
            description="Stay compliant with automated assessments and customized recommendations."
            onClick={() => router.push('/compliance')}
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Secure Platform"
            description="Enterprise-grade security and GDPR compliance for all your sensitive legal communications."
            onClick={() => router.push('/security')}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of businesses and legal professionals who trust CyberLegalExperts for their cybersecurity law needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
              Register as Expert
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push('/chat')}>
              Find Legal Help
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">CyberLegalExperts</h3>
              <p className="text-muted-foreground">
                Your trusted platform for cybersecurity legal expertise.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Find an Expert</li>
                <li>Law Database</li>
                <li>Compliance Tools</li>
                <li>Knowledge Hub</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>About Us</li>
                <li>Contact</li>
                <li>Careers</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Cookie Policy</li>
                <li>GDPR Compliance</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 CyberLegalExperts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  onClick?: () => void;
}) {
  return (
    <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
}