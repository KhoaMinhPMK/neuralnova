#!/bin/bash
# NeuralNova File Server - VPS Auto Setup Script
# Run on VPS: bash setup-vps.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 NeuralNova File Server - VPS Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Don't run as root. Run as normal user with sudo access.${NC}"
   exit 1
fi

# Step 1: Check Node.js
echo "📦 Step 1: Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not found. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js installed${NC}"
fi

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm install --production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ npm install failed${NC}"
    exit 1
fi

# Step 3: Create upload directories
echo ""
echo "📂 Step 3: Creating upload directories..."
mkdir -p uploads/avatars
mkdir -p uploads/covers
mkdir -p uploads/posts
chmod -R 755 uploads
echo -e "${GREEN}✅ Upload directories created${NC}"

# Step 4: Install PM2
echo ""
echo "📦 Step 4: Checking PM2..."
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 already installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
fi

# Step 5: Start server
echo ""
echo "🚀 Step 5: Starting server..."
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Server started${NC}"
else
    echo -e "${RED}❌ Server start failed${NC}"
    exit 1
fi

# Step 6: Save PM2 config
echo ""
echo "💾 Step 6: Saving PM2 configuration..."
pm2 save
echo -e "${GREEN}✅ Configuration saved${NC}"

# Step 7: Setup auto-start
echo ""
echo "🔧 Step 7: Setting up auto-start..."
echo -e "${YELLOW}Run this command to enable auto-start on boot:${NC}"
echo ""
pm2 startup | grep "sudo"
echo ""

# Step 8: Configure firewall
echo ""
echo "🔥 Step 8: Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 3000/tcp
    sudo ufw reload
    echo -e "${GREEN}✅ Firewall configured (UFW)${NC}"
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=3000/tcp
    sudo firewall-cmd --reload
    echo -e "${GREEN}✅ Firewall configured (Firewalld)${NC}"
else
    echo -e "${YELLOW}⚠️  No firewall detected. May need manual configuration.${NC}"
fi

# Step 9: Test
echo ""
echo "🧪 Step 9: Testing server..."
sleep 2
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)

if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Server is healthy!${NC}"
    echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Server Status:"
pm2 list
echo ""
echo "🔗 Endpoints:"
echo "  Health:  https://neuralnova.space:3000/health"
echo "  Avatar:  https://neuralnova.space:3000/upload/avatar"
echo "  Cover:   https://neuralnova.space:3000/upload/cover"
echo "  Post:    https://neuralnova.space:3000/upload/post"
echo ""
echo "📋 Useful Commands:"
echo "  pm2 list                          # List processes"
echo "  pm2 logs neuralnova-files         # View logs"
echo "  pm2 restart neuralnova-files      # Restart server"
echo "  pm2 monit                         # Monitor resources"
echo ""
echo "🧪 Test from browser:"
echo "  https://neuralnova.space:3000/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

