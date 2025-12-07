# Deployment Guide
## Verified AI Resume & Degree Checker on Flare Network

---

## 📋 Prerequisites

Before deploying, ensure you have:

- Node.js 18+ and npm/yarn installed
- MongoDB or PostgreSQL database
- Redis server (for caching and queues)
- Flare-compatible wallet (MetaMask or Flare Wallet)
- Flare Testnet tokens (for testing) or Mainnet tokens (for production)
- API keys for:
  - OpenAI / Azure OpenAI / Anthropic Claude / Google Gemini
  - IPFS service (Infura, Pinata, or self-hosted)
  - FDC (Flare Data Connector)
  - FTSO (Flare Time Series Oracle)

---

## 🚀 Local Development Setup

### Step 1: Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd verified-ai-resume-checker

# Install root dependencies
npm install

# Install all sub-project dependencies
npm run install-all
```

### Step 2: Configure Environment Variables

Copy the environment template and configure:

```bash
# Backend
cp env.example.txt backend/.env
# Edit backend/.env with your configuration

# Frontend (optional)
cp env.example.txt frontend/.env
# Edit frontend/.env with your configuration
```

### Step 3: Start Database and Redis

```bash
# Start MongoDB (if using)
mongod

# OR start PostgreSQL (if using)
pg_ctl start

# Start Redis
redis-server
```

### Step 4: Deploy Smart Contracts (Flare Testnet)

```bash
cd contracts

# Configure Hardhat
# Edit hardhat.config.js with your Flare RPC URL and private key

# Compile contracts
npm run compile

# Deploy to Flare Testnet
npm run deploy:testnet
```

**Save the deployed contract addresses** from the deployment output. You'll need them in your backend `.env` file.

### Step 5: Configure Backend

Update `backend/.env` with contract addresses:

```env
VERIFICATION_REGISTRY_ADDRESS=0x...
ATTESTATION_NFT_ADDRESS=0x...
FASSET_WRAPPER_ADDRESS=0x...
GOVERNMENT_SMART_ACCOUNT_ADDRESS=0x...
```

### Step 6: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

### Step 7: Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3001`

---

## 🌐 Production Deployment

### Option 1: Docker Deployment

#### Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Create Dockerfile for Frontend

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    env_file:
      - backend/.env

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Option 2: Cloud Platform Deployment

#### Deploy to AWS

1. **Backend (Elastic Beanstalk or ECS)**
   - Use AWS RDS for PostgreSQL
   - Use ElastiCache for Redis
   - Configure environment variables in AWS Console

2. **Frontend (S3 + CloudFront)**
   - Build frontend: `cd frontend && npm run build`
   - Upload `dist/` to S3 bucket
   - Configure CloudFront distribution

3. **Smart Contracts**
   - Deploy to Flare Mainnet using Hardhat
   - Store contract addresses securely

#### Deploy to Heroku

```bash
# Backend
cd backend
heroku create verified-resume-backend
heroku addons:create mongolab:sandbox
heroku addons:create heroku-redis:hobby-dev
heroku config:set NODE_ENV=production
git push heroku main

# Frontend
cd frontend
heroku create verified-resume-frontend --buildpack heroku/nodejs
git push heroku main
```

---

## 🔗 Flare Network Deployment

### Deploy to Flare Testnet (Coston2)

1. **Get Testnet Tokens**
   - Visit Flare Faucet: https://faucet.flare.network
   - Request testnet FLR tokens

2. **Configure Network in MetaMask**
   ```
   Network Name: Flare Testnet (Coston2)
   RPC URL: https://coston2-api.flare.network/ext/bc/C/rpc
   Chain ID: 114
   Currency Symbol: FLR
   Block Explorer: https://coston2-explorer.flare.network
   ```

3. **Deploy Contracts**
   ```bash
   cd contracts
   npm run deploy:testnet
   ```

4. **Update Backend Configuration**
   ```env
   FLARE_NETWORK=testnet
   FLARE_RPC_URL=https://coston2-api.flare.network/ext/bc/C/rpc
   FLARE_CHAIN_ID=114
   ```

### Deploy to Flare Mainnet

1. **Prepare Mainnet Configuration**
   ```env
   FLARE_NETWORK=mainnet
   FLARE_RPC_URL=https://flare-api.flare.network/ext/bc/C/rpc
   FLARE_CHAIN_ID=14
   ```

2. **Deploy Contracts**
   ```bash
   cd contracts
   npm run deploy:mainnet
   ```

3. **Verify Contracts on Explorer**
   ```bash
   npx hardhat verify --network flare-mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
   ```

4. **Configure Government Smart Accounts**
   - Add government official addresses
   - Set multi-signature requirements
   - Configure role-based access

---

## 🔐 Security Configuration

### Environment Variables Security

- Never commit `.env` files to git
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate API keys regularly
- Use different keys for testnet/mainnet

### Database Security

- Use encrypted connections (SSL/TLS)
- Enable database authentication
- Restrict database access by IP
- Regular backups

### API Security

- Enable CORS only for trusted domains
- Implement rate limiting
- Use HTTPS in production
- Enable Helmet.js security headers

### Smart Contract Security

- Conduct security audits before mainnet deployment
- Use multi-signature wallets for contract ownership
- Implement access control and role-based permissions
- Test thoroughly on testnet

---

## 📊 Monitoring and Maintenance

### Application Monitoring

- Set up error tracking (Sentry, Rollbar)
- Monitor API response times
- Track blockchain transaction success rates
- Monitor database performance

### Blockchain Monitoring

- Track contract interactions
- Monitor gas usage
- Watch for failed transactions
- Monitor FDC and FTSO oracle feeds

### Logging

- Centralized logging (ELK Stack, CloudWatch)
- Log all verification requests
- Audit trail for government actions
- Error logging with stack traces

---

## 🔄 Update and Maintenance

### Updating Smart Contracts

1. Deploy new contract version
2. Migrate data if needed
3. Update backend configuration
4. Test thoroughly on testnet first

### Updating Backend

1. Pull latest code
2. Run database migrations
3. Update dependencies: `npm update`
4. Restart services

### Updating Frontend

1. Build new version: `npm run build`
2. Deploy to hosting service
3. Clear CDN cache if using

---

## 🧪 Testing Deployment

### Verify Backend

```bash
# Health check
curl http://localhost:3000/health

# API test
curl http://localhost:3000/api/v1/verify/status
```

### Verify Frontend

- Visit `http://localhost:3001`
- Test wallet connection
- Test resume upload
- Test verification flow

### Verify Smart Contracts

```bash
# Test contract interaction
cd contracts
npm test

# Verify on explorer
# Visit Flare Explorer and check contract deployment
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database is running
   - Verify connection string in `.env`
   - Check firewall settings

2. **Contract Deployment Failed**
   - Check account has sufficient FLR tokens
   - Verify RPC URL is correct
   - Check network configuration

3. **Wallet Connection Issues**
   - Ensure MetaMask is installed
   - Check network is set to Flare
   - Clear browser cache

4. **API Errors**
   - Check backend logs
   - Verify environment variables
   - Check rate limiting

---

## 📞 Support

For deployment issues:
- Check logs: `backend/logs/` and browser console
- Review documentation: `docs/`
- Open GitHub issue

---

**Last Updated**: 2024
**Version**: 1.0.0

