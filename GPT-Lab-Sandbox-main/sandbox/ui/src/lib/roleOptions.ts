/**
 * SW4E Role Options - Comprehensive Role System
 * This provides all 27 roles organized by category for frontend use
 */

export interface RoleOption {
  value: string;
  label: string;
  description: string;
  category: string;
  accessLevel: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';
  icon?: string;
}

// Role options organized by category
export const roleOptions: RoleOption[] = [
  // System Administration Roles
  {
    value: 'super_admin',
    label: 'Super Administrator',
    description: 'Full system access, user approval, organization management',
    category: 'administrative',
    accessLevel: 'super_admin',
    color: 'red',
    icon: 'Shield'
  },
  {
    value: 'research_admin',
    label: 'Research Administrator',
    description: 'Organization-level administration, user management',
    category: 'administrative',
    accessLevel: 'org_admin',
    color: 'orange',
    icon: 'Users'
  },

  // University/Institutional Roles
  {
    value: 'university_admin',
    label: 'University Administrator',
    description: 'University system administration, student management',
    category: 'institutional',
    accessLevel: 'org_admin',
    color: 'blue',
    icon: 'GraduationCap'
  },
  {
    value: 'university_coordinator',
    label: 'Research Coordinator',
    description: 'Research project coordination, team management',
    category: 'institutional',
    accessLevel: 'manager',
    color: 'green',
    icon: 'Target'
  },
  {
    value: 'university_faculty',
    label: 'Faculty Member/Professor',
    description: 'AI services access, student mentorship, research',
    category: 'institutional',
    accessLevel: 'professional',
    color: 'blue',
    icon: 'BookOpen'
  },
  {
    value: 'university_researcher',
    label: 'University Research Staff',
    description: 'Research execution, data analysis, collaboration',
    category: 'institutional',
    accessLevel: 'professional',
    color: 'green',
    icon: 'Microscope'
  },
  {
    value: 'university_student',
    label: 'Graduate/PhD Student',
    description: 'Basic AI services, learning resources, mentorship',
    category: 'institutional',
    accessLevel: 'support',
    color: 'yellow',
    icon: 'GraduationCap'
  },

  // Corporate/Industry Roles
  {
    value: 'corporate_admin',
    label: 'Corporate Administrator',
    description: 'Corporate system administration, compliance oversight',
    category: 'corporate',
    accessLevel: 'org_admin',
    color: 'purple',
    icon: 'Building2'
  },
  {
    value: 'corporate_manager',
    label: 'R&D Manager/Director',
    description: 'Team oversight, project coordination, resource allocation',
    category: 'corporate',
    accessLevel: 'manager',
    color: 'orange',
    icon: 'Users'
  },
  {
    value: 'corporate_researcher',
    label: 'Corporate Research Scientist',
    description: 'AI services, security tools, compliance auditing',
    category: 'corporate',
    accessLevel: 'professional',
    color: 'blue',
    icon: 'Microscope'
  },
  {
    value: 'corporate_analyst',
    label: 'Data/Business Analyst',
    description: 'Data analysis, business intelligence, reporting',
    category: 'corporate',
    accessLevel: 'support',
    color: 'green',
    icon: 'BarChart3'
  },
  {
    value: 'corporate_intern',
    label: 'Research Intern/Trainee',
    description: 'Learning resources, supervised research',
    category: 'corporate',
    accessLevel: 'support',
    color: 'yellow',
    icon: 'BookOpen'
  },

  // Individual Research Roles
  {
    value: 'independent_researcher',
    label: 'Independent Researcher',
    description: 'Full research capabilities, funding requests',
    category: 'research',
    accessLevel: 'professional',
    color: 'blue',
    icon: 'Microscope'
  },
  {
    value: 'consultant',
    label: 'Research Consultant',
    description: 'Project-based access, specialized expertise',
    category: 'research',
    accessLevel: 'professional',
    color: 'green',
    icon: 'User'
  },
  {
    value: 'postdoc',
    label: 'Postdoctoral Researcher',
    description: 'Advanced research, mentorship, collaboration',
    category: 'research',
    accessLevel: 'professional',
    color: 'blue',
    icon: 'GraduationCap'
  },
  {
    value: 'visiting_scholar',
    label: 'Visiting Scholar',
    description: 'Limited research access, collaboration viewing',
    category: 'research',
    accessLevel: 'guest',
    color: 'yellow',
    icon: 'Globe'
  },
  {
    value: 'researcher',
    label: 'Researcher',
    description: 'Full research capabilities',
    category: 'research',
    accessLevel: 'professional',
    color: 'blue',
    icon: 'Microscope'
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to assigned resources',
    category: 'research',
    accessLevel: 'support',
    color: 'gray',
    icon: 'Eye'
  },

  // Technical Specialist Roles
  {
    value: 'data_scientist',
    label: 'Data Scientist',
    description: 'Advanced analytics, ML modeling, data engineering',
    category: 'technical',
    accessLevel: 'professional',
    color: 'blue',
    icon: 'Database'
  },
  {
    value: 'ml_engineer',
    label: 'Machine Learning Engineer',
    description: 'AI model development, ML pipelines, deployment',
    category: 'technical',
    accessLevel: 'professional',
    color: 'purple',
    icon: 'Cpu'
  },
  {
    value: 'ai_researcher',
    label: 'AI Research Specialist',
    description: 'Cutting-edge AI research, advanced algorithms',
    category: 'technical',
    accessLevel: 'professional',
    color: 'blue',
    icon: 'Brain'
  },
  {
    value: 'security_analyst',
    label: 'Security & Compliance Specialist',
    description: 'Security tools, compliance auditing, risk assessment',
    category: 'technical',
    accessLevel: 'professional',
    color: 'red',
    icon: 'Shield'
  },

  // Platform Support Roles
  {
    value: 'platform_moderator',
    label: 'Platform Moderator',
    description: 'Content moderation, user support, community management',
    category: 'administrative',
    accessLevel: 'support',
    color: 'green',
    icon: 'Users'
  },
  {
    value: 'platform_support',
    label: 'Technical Support Specialist',
    description: 'User assistance, technical support, issue resolution',
    category: 'administrative',
    accessLevel: 'support',
    color: 'blue',
    icon: 'HelpCircle'
  },
  {
    value: 'platform_auditor',
    label: 'Compliance Auditor',
    description: 'Compliance auditing, security assessment, audit reporting',
    category: 'administrative',
    accessLevel: 'support',
    color: 'orange',
    icon: 'FileCheck'
  },

  // External Stakeholder Roles
  {
    value: 'government_official',
    label: 'Government Representative',
    description: 'Policy oversight, compliance monitoring',
    category: 'external',
    accessLevel: 'guest',
    color: 'purple',
    icon: 'Building2'
  },
  {
    value: 'regulatory_officer',
    label: 'Regulatory Compliance Officer',
    description: 'Compliance oversight, regulatory reporting',
    category: 'external',
    accessLevel: 'guest',
    color: 'orange',
    icon: 'Shield'
  },
  {
    value: 'funding_agency',
    label: 'Funding Agency Representative',
    description: 'Funding oversight, project monitoring',
    category: 'external',
    accessLevel: 'guest',
    color: 'green',
    icon: 'DollarSign'
  },
  {
    value: 'industry_partner',
    label: 'Industry Collaboration Partner',
    description: 'Collaboration access, project participation',
    category: 'external',
    accessLevel: 'guest',
    color: 'blue',
    icon: 'Handshake'
  }
];

// Helper functions
export const getRoleOptionsByCategory = (category: string): RoleOption[] => {
  return roleOptions.filter(role => role.category === category);
};

export const getRoleOptionsByAccessLevel = (accessLevel: string): RoleOption[] => {
  return roleOptions.filter(role => role.accessLevel === accessLevel);
};

export const getRoleOption = (value: string): RoleOption | undefined => {
  return roleOptions.find(role => role.value === value);
};

export const getRoleCategories = (): string[] => {
  return [...new Set(roleOptions.map(role => role.category))];
};

export const getAccessLevels = (): string[] => {
  return [...new Set(roleOptions.map(role => role.accessLevel))];
};

// Role categories with descriptions
export const roleCategories = {
  administrative: {
    name: 'System Administration',
    description: 'Platform and system administration roles',
    icon: 'Shield'
  },
  institutional: {
    name: 'University/Institutional',
    description: 'Academic and institutional roles',
    icon: 'GraduationCap'
  },
  corporate: {
    name: 'Corporate/Industry',
    description: 'Business and industry roles',
    icon: 'Building2'
  },
  research: {
    name: 'Research',
    description: 'Individual and collaborative research roles',
    icon: 'Microscope'
  },
  technical: {
    name: 'Technical Specialist',
    description: 'Specialized technical roles',
    icon: 'Cpu'
  },
  external: {
    name: 'External Stakeholder',
    description: 'External partners and stakeholders',
    icon: 'Globe'
  }
};

// Access levels with descriptions
export const accessLevels = {
  super_admin: {
    name: 'Super Administrator',
    description: 'Full system access and control',
    color: 'red'
  },
  org_admin: {
    name: 'Organization Administrator',
    description: 'Organization-level administration',
    color: 'orange'
  },
  manager: {
    name: 'Manager',
    description: 'Team and project management',
    color: 'yellow'
  },
  professional: {
    name: 'Professional',
    description: 'Full research and technical capabilities',
    color: 'blue'
  },
  support: {
    name: 'Support',
    description: 'Limited access for support functions',
    color: 'green'
  },
  guest: {
    name: 'Guest',
    description: 'Read-only access for external stakeholders',
    color: 'gray'
  }
};
