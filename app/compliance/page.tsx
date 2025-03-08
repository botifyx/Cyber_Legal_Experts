"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const mockAssessment = {
  score: 75,
  totalChecks: 50,
  passedChecks: 38,
  criticalIssues: 3,
  categories: [
    {
      name: "Data Protection",
      score: 85,
      checks: [
        { name: "Data Encryption", status: "passed" },
        { name: "Access Controls", status: "passed" },
        { name: "Data Retention", status: "failed" }
      ]
    },
    {
      name: "Incident Response",
      score: 65,
      checks: [
        { name: "Incident Documentation", status: "passed" },
        { name: "Response Time", status: "warning" },
        { name: "Team Training", status: "failed" }
      ]
    }
  ]
};

export default function ComplianceTools() {
  const [assessment, setAssessment] = useState(mockAssessment);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Compliance Assessment</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
          <div className="text-4xl font-bold text-primary mb-2">{assessment.score}%</div>
          <Progress value={assessment.score} className="h-2" />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Checks</h3>
          <div className="text-4xl font-bold">{assessment.totalChecks}</div>
          <p className="text-muted-foreground">Items evaluated</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Passed Checks</h3>
          <div className="text-4xl font-bold text-green-600">{assessment.passedChecks}</div>
          <p className="text-muted-foreground">Requirements met</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Critical Issues</h3>
          <div className="text-4xl font-bold text-destructive">{assessment.criticalIssues}</div>
          <p className="text-muted-foreground">Need immediate attention</p>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {assessment.categories.map((category, index) => (
          <Card key={index} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <div className="text-2xl font-bold">{category.score}%</div>
            </div>
            <Progress value={category.score} className="h-2 mb-4" />
            
            <div className="space-y-4">
              {category.checks.map((check, checkIndex) => (
                <div key={checkIndex} className="flex items-center justify-between">
                  <span>{check.name}</span>
                  {check.status === "passed" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {check.status === "failed" && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  {check.status === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6 bg-primary text-primary-foreground">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold mb-2">Need Expert Guidance?</h3>
            <p>Get personalized recommendations from our legal experts</p>
          </div>
          <Button variant="secondary" onClick={() => window.location.href = '/experts'}>
            Connect with Expert
          </Button>
        </div>
      </Card>
    </div>
  );
}