'use client';

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ServiceCategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  services: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    status: 'active' | 'beta' | 'new';
  }>;
  isExpanded: boolean;
  onToggle: () => void;
  onServiceClick: (serviceId: string) => void;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  hoverColor: string;
}

export default function ServiceCategoryCard({
  title,
  description,
  icon,
  services,
  isExpanded,
  onToggle,
  onServiceClick,
  gradientFrom,
  gradientTo,
  borderColor,
  hoverColor
}: ServiceCategoryCardProps) {
  return (
    <div className="bg-gradient-to-r from-background to-surface/30 rounded-3xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300">
      {/* Category Header */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center mr-6 group-hover:scale-105 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-text-secondary">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="green" className="text-sm">
            {services.length} services
          </Badge>
          {isExpanded ? (
            <ChevronDown className="w-6 h-6 text-text-primary group-hover:text-primary transition-colors duration-300" />
          ) : (
            <ChevronRight className="w-6 h-6 text-text-primary group-hover:text-primary transition-colors duration-300" />
          )}
        </div>
      </div>

      {/* Expanded Services Grid */}
      {isExpanded && (
        <div className="mt-8 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card 
                key={service.id}
                className="p-6 bg-surface/50 border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer group"
                onClick={() => onServiceClick(service.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
                    {service.name}
                  </h4>
                  <Badge 
                    variant={
                      service.status === 'active' ? 'green' :
                      service.status === 'beta' ? 'yellow' : 'accent'
                    }
                    className="text-xs"
                  >
                    {service.status}
                  </Badge>
                </div>
                
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary capitalize">
                    {service.type.replace('_', ' ')}
                  </span>
                  <Button 
                    size="sm" 
                    className="btn-primary text-xs px-4 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceClick(service.id);
                    }}
                  >
                    Try Service
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
