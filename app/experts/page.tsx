"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star } from "lucide-react";

const mockExperts = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    location: "San Francisco, CA",
    specialization: "Data Privacy & GDPR",
    rating: 4.9,
    reviews: 127,
  },
  {
    id: 2,
    name: "James Wilson",
    location: "New York, NY",
    specialization: "Cybercrime & Digital Forensics",
    rating: 4.8,
    reviews: 93,
  },
  // Add more mock experts...
];

export default function ExpertDirectory() {
  const [location, setLocation] = useState("");
  const [experts, setExperts] = useState(mockExperts);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call the OpenAI API
    // to search for experts based on location
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find a Cyber Legal Expert</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location..."
              className="w-full"
            />
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      <div className="grid gap-6">
        {experts.map((expert) => (
          <Card key={expert.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-2">{expert.name}</h3>
                <p className="text-muted-foreground flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {expert.location}
                </p>
                <p className="text-muted-foreground mb-4">{expert.specialization}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="font-bold">{expert.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">{expert.reviews} reviews</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/chat'}>
                Message
              </Button>
              <Button>Book Consultation</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}