"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Globe, BookOpen, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockLaws = [
  {
    id: 1,
    country: "European Union",
    title: "General Data Protection Regulation (GDPR)",
    summary: "Comprehensive data protection law that standardizes data privacy laws across Europe.",
    keyPoints: [
      "Right to be forgotten",
      "Data portability",
      "Privacy by design",
      "Mandatory breach notification"
    ],
    penalties: "Up to €20 million or 4% of global revenue"
  },
  {
    id: 2,
    country: "United States",
    title: "California Consumer Privacy Act (CCPA)",
    summary: "State-level privacy law that enhances privacy rights and consumer protection.",
    keyPoints: [
      "Right to access personal data",
      "Right to delete personal data",
      "Opt-out rights",
      "Data breach liability"
    ],
    penalties: "Up to $7,500 per intentional violation"
  }
];

export default function LawDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [laws, setLaws] = useState(mockLaws);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would filter laws based on search query and country
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Globe className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Cyber Law Database</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laws..."
            className="flex-1"
          />
          <Input
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            placeholder="Country/Region..."
            className="flex-1"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      <div className="grid gap-6">
        {laws.map((law) => (
          <Card key={law.id} className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">{law.title}</h3>
              <p className="text-muted-foreground mb-2">{law.country}</p>
              <p className="mb-4">{law.summary}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Key Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {law.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center text-destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Penalties: {law.penalties}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}