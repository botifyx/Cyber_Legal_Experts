"use client";

import { Card } from "@/components/ui/card";
import { Shield, Lock, Key, Database, Server, UserCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: <Lock className="h-8 w-8" />,
    title: "End-to-End Encryption",
    description: "All communications between users and experts are encrypted using industry-standard protocols."
  },
  {
    icon: <Key className="h-8 w-8" />,
    title: "Access Control",
    description: "Multi-factor authentication and role-based access control ensure secure account access."
  },
  {
    icon: <Database className="h-8 w-8" />,
    title: "Data Protection",
    description: "Your data is stored in secure, encrypted databases with regular backups and monitoring."
  },
  {
    icon: <Server className="h-8 w-8" />,
    title: "Infrastructure Security",
    description: "Our platform runs on enterprise-grade cloud infrastructure with multiple security layers."
  },
  {
    icon: <UserCheck className="h-8 w-8" />,
    title: "Expert Verification",
    description: "All legal experts undergo thorough background checks and credential verification."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Compliance",
    description: "We maintain compliance with GDPR, CCPA, and other relevant data protection regulations."
  }
];

const certifications = [
  {
    name: "ISO 27001",
    description: "Information security management system certification"
  },
  {
    name: "SOC 2 Type II",
    description: "Security, availability, and confidentiality controls"
  },
  {
    name: "GDPR Compliant",
    description: "European Union data protection requirements"
  },
  {
    name: "HIPAA Compliant",
    description: "Healthcare information privacy and security"
  }
];

export default function Security() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Platform Security</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your security and privacy are our top priorities. Learn about our comprehensive security measures and compliance standards.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {securityFeatures.map((feature, index) => (
          <Card key={index} className="p-6">
            <div className="text-primary mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Security Certifications</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-start">
              <Shield className="h-5 w-5 text-primary mt-1 mr-3" />
              <div>
                <h3 className="font-semibold mb-1">{cert.name}</h3>
                <p className="text-muted-foreground">{cert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8 bg-primary text-primary-foreground text-center">
        <h2 className="text-2xl font-bold mb-4">Have Security Concerns?</h2>
        <p className="text-lg mb-6">
          Our team is available 24/7 to address any security questions or concerns you may have.
        </p>
        <div className="flex justify-center gap-4">
          <a href="mailto:security@cyberlegalexperts.com" className="underline">
            security@cyberlegalexperts.com
          </a>
          <span>|</span>
          <a href="tel:+1-800-SECURITY" className="underline">
            1-800-SECURITY
          </a>
        </div>
      </Card>
    </div>
  );
}