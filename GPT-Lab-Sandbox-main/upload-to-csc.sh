#!/bin/bash

# Upload SW4E Sandbox to CSC Server
# Replace 'csc-server' with your actual server name/address

echo "🚀 Uploading SW4E Sandbox to CSC Server..."

# Upload the clean deployment package
scp -r /Users/svm648/SW4E-Sandbox/csc-deployment csc-server:~/sw4e-sandbox

echo "✅ Upload complete!"
echo ""
echo "📋 Next steps on CSC server:"
echo "1. SSH to your server: ssh csc-server"
echo "2. Navigate to project: cd ~/sw4e-sandbox"
echo "3. Run deployment: chmod +x deploy.sh && ./deploy.sh"
echo ""
echo "🎯 Access points after deployment:"
echo "- Frontend: http://your-server:3000"
echo "- Backend: http://your-server:8080"
echo "- Health: http://your-server:8080/health"
