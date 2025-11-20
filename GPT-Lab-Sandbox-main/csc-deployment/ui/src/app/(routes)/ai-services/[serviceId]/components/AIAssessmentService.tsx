'use client';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Brain, Target } from 'lucide-react';

interface AIAssessmentServiceProps {
  service: any;
}

export default function AIAssessmentService({ service }: AIAssessmentServiceProps) {
  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Brain className="w-8 h-8 text-purple-500" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">AI Assessment Service</h3>
      <p className="text-text-secondary mb-4">
        Full implementation coming soon. This service will provide AI technique recommendations and implementation guidance.
      </p>
      <Button className="btn-primary">
        <Target className="w-4 h-4 mr-2" />
        Coming Soon
      </Button>
    </Card>
  );
}
