"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Clock, User, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockArticles = [
  {
    id: 1,
    title: "Understanding GDPR Compliance in 2025",
    category: "Compliance",
    author: "Dr. Sarah Chen",
    date: "March 15, 2025",
    readTime: "8 min read",
    summary: "A comprehensive guide to maintaining GDPR compliance in the evolving digital landscape.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=500"
  },
  {
    id: 2,
    title: "Cybersecurity Laws: A Global Perspective",
    category: "Legal Framework",
    author: "James Wilson",
    date: "March 14, 2025",
    readTime: "12 min read",
    summary: "Comparing cybersecurity regulations across different jurisdictions and their impact on global business.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=500"
  }
];

export default function KnowledgeHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState(mockArticles);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would filter articles based on search query
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <BookOpen className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Knowledge Hub</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="flex-1"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      <div className="grid gap-8 md:grid-cols-2">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <div 
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${article.image})` }}
            />
            <div className="p-6">
              <div className="mb-4">
                <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold mb-2">
                  {article.category}
                </span>
                <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                <p className="text-muted-foreground">{article.summary}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {article.author}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {article.readTime}
                </div>
              </div>

              <Button variant="link" className="mt-4 p-0">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}