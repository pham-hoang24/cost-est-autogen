import { Router } from 'express';

const router = Router();

// Simple service discovery endpoint
router.get('/services', async (req, res) => {
  try {
    const services = [
      {
        name: 'sw4e-control-plane',
        type: 'core',
        url: 'http://localhost:8080',
        healthCheck: 'http://localhost:8080/api/health',
        status: 'healthy',
        version: '2.0.0',
        capabilities: ['api-gateway', 'data-anonymization', 'llm-management']
      },
      {
        name: 'sw4e-ui',
        type: 'core', 
        url: 'http://localhost:3001',
        healthCheck: 'http://localhost:3001',
        status: 'healthy',
        version: '2.0.0',
        capabilities: ['dashboard', 'user-interface']
      }
    ];

    // Check for external microservices
    const externalServices = await discoverExternalServices();
    services.push(...externalServices);

    // Check health of each service
    const healthChecks = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const healthStatus = await checkServiceHealth(service.healthCheck);
          return {
            ...service,
            status: healthStatus ? 'healthy' : 'unhealthy',
            lastChecked: new Date().toISOString()
          };
        } catch (error) {
          return {
            ...service,
            status: 'unhealthy',
            lastChecked: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const servicesWithHealth = healthChecks.map((result) => 
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean);

    res.json({
      services: servicesWithHealth,
      totalServices: servicesWithHealth.length,
      healthyServices: servicesWithHealth.filter(s => s.status === 'healthy').length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to discover services:', error);
    res.status(500).json({ 
      error: 'Failed to discover services',
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for microservices
router.use('/proxy/:serviceName/*', async (req, res) => {
  const { serviceName } = req.params;
  const path = req.params[0];
  
  try {
    // Find the service
    const serviceUrl = getServiceUrl(serviceName);
    if (!serviceUrl) {
      return res.status(404).json({ error: `Service ${serviceName} not found` });
    }

    const targetUrl = `${serviceUrl}/${path}`;
    
    // Proxy the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers as any,
        'host': undefined // Remove host header to avoid conflicts
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    // Forward the response
    const data = await response.text();
    res.status(response.status);
    
    // Forward response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    res.send(data);
  } catch (error) {
    console.error(`Proxy error for service ${serviceName}:`, error);
    res.status(502).json({ 
      error: 'Service proxy error',
      service: serviceName,
      timestamp: new Date().toISOString()
    });
  }
});

// Service registration endpoint (for dynamic discovery)
router.post('/register', async (req, res) => {
  try {
    const { name, url, healthCheck, capabilities, version } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ error: 'Service name and URL are required' });
    }

    // In a real implementation, this would store in a service registry
    console.log(`Registering service: ${name} at ${url}`);
    
    res.json({
      message: 'Service registered successfully',
      service: { name, url, healthCheck, capabilities, version },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Service registration error:', error);
    res.status(500).json({ error: 'Failed to register service' });
  }
});

// Helper functions
async function discoverExternalServices() {
  const externalServices = [];

  // Check common microservice ports (8081 is data-anonymization-service)
  const commonPorts = [8081, 8082, 8083, 8084, 8085];
  
  for (const port of commonPorts) {
    try {
      const url = `http://localhost:${port}`;
      const healthUrl = `${url}/health`;
      
      const isHealthy = await checkServiceHealth(healthUrl);
      if (isHealthy) {
        // Try to get service info
        try {
          const infoResponse = await fetch(`${url}/info`, { 
            method: 'GET',
            signal: AbortSignal.timeout(2000)
          });
          
          if (infoResponse.ok) {
            const info = await infoResponse.json();
            externalServices.push({
              name: info.name || `service-${port}`,
              type: 'external',
              url,
              healthCheck: healthUrl,
              status: 'healthy',
              version: info.version || '1.0.0',
              capabilities: info.capabilities || ['unknown']
            });
          } else {
            // Service is healthy but doesn't have info endpoint
            externalServices.push({
              name: `service-${port}`,
              type: 'external',
              url,
              healthCheck: healthUrl,
              status: 'healthy',
              version: '1.0.0',
              capabilities: ['unknown']
            });
          }
        } catch (error) {
          // Service is healthy but doesn't have info endpoint
          externalServices.push({
            name: `service-${port}`,
            type: 'external',
            url,
            healthCheck: healthUrl,
            status: 'healthy',
            version: '1.0.0',
            capabilities: ['unknown']
          });
        }
      }
    } catch (error) {
      // Service not available on this port
      continue;
    }
  }

  return externalServices;
}

async function checkServiceHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function getServiceUrl(serviceName: string): string | null {
  // Map of known services
  const serviceMap: Record<string, string> = {
    'data-anonymization-backend': 'http://localhost:8081',
    'data-anonymization-service': 'http://localhost:8081', // Alias
    'data-anon': 'http://localhost:8081', // Short alias
    'control-plane': 'http://localhost:8080',
    'ui': 'http://localhost:3001',
    'auth-service': 'http://localhost:8082',
    'notification-service': 'http://localhost:8083',
    'analytics-service': 'http://localhost:8084'
  };

  return serviceMap[serviceName] || null;
}

export default router;
