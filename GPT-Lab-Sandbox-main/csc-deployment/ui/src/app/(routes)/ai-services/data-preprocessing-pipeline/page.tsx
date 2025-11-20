'use client';

import React from 'react';
import ProfessionalDataPreprocessingPipelineService from '../[serviceId]/components/ProfessionalDataPreprocessingPipelineService';

export default function DataPreprocessingPipelinePage() {
  const service = {
    id: 'data-preprocessing-pipeline',
    name: 'Data Preprocessing Pipeline',
    description: 'Professional-grade data cleaning, transformation, and analysis with comprehensive reporting'
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <ProfessionalDataPreprocessingPipelineService service={service} />
      </div>
    </div>
  );
}
