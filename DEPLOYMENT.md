# GREEN MAX - Deployment Guide

Complete guide for deploying the GREEN MAX investment platform to production.

## Prerequisites

- Node.js v16+ installed
- MongoDB v5+ installed or MongoDB Atlas account
- Git installed
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/ahmad-coder45/green-max-investment-platform.git
cd green-max-investment-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create `.env` file in backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/greenmax
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/greenmax
```

### 5. Start Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on `http://localhost:5000`

### 6. Frontend Setup

Open `frontend/index.html` in a browser or use a local server:

```bash
# Using Python
cd frontend
python -m http.server 3000

# Using Node.js http-server
npx http-server frontend -p 3000

# Using VS Code Live Server extension
# Right-click index.html -> Open with Live Server
```

Frontend will run on `http://localhost:3000`

## Production Deployment

### Option 1: Deploy to Heroku

#### Backend Deployment

1. **Create Heroku App**
```bash
heroku create greenmax-api
```

2. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_production_secret
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
```

3. **Deploy**
```bash
git subtree push --prefix backend heroku main
```

#### Frontend Deployment (Netlify)

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Deploy**
```bash
cd frontend
netlify deploy --prod
```

3. **Update API URL**
Edit `frontend/js/auth.js` and update:
```javascript
const API_URL = 'https://greenmax-api.herokuapp.com/api';
```

### Option 2: Deploy to DigitalOcean/AWS

#### Backend (Ubuntu Server)

1. **SSH into Server**
```bash
ssh root@your-server-ip
```

2. **Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Install PM2
npm install -g pm2
```

3. **Clone and Setup**
```bash
cd /var/www
git clone https://github.com/ahmad-coder45/green-max-investment-platform.git
cd green-max-investment-platform/backend
npm install --production
```

4. **Configure Environment**
```bash
nano .env
# Add production environment variables
```

5. **Start with PM2**
```bash
pm2 start server.js --name greenmax-api
pm2 save
pm2 startup
```

6. **Setup Nginx Reverse Proxy**
```bash
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/greenmax
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.greenmax.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/greenmax /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

7. **Setup SSL with Let's Encrypt**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.greenmax.com
```

#### Frontend Deployment

1. **Upload to Server**
```bash
scp -r frontend/* root@your-server-ip:/var/www/html/
```

2. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name greenmax.com www.greenmax.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Setup SSL**
```bash
certbot --nginx -d greenmax.com -d www.greenmax.com
```

### Option 3: Deploy to Railway

#### Backend

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy**
```bash
cd backend
railway login
railway init
railway up
```

3. **Add Environment Variables**
Go to Railway dashboard and add all environment variables.

#### Frontend (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

## Database Setup

### Create Admin User

After deployment, create an admin user:

```bash
# Connect to MongoDB
mongo greenmax

# Or MongoDB Atlas
mongo "mongodb+srv://cluster.mongodb.net/greenmax" --username admin

# Create admin user
db.users.insertOne({
  username: "admin",
  email: "admin@greenmax.com",
  password: "$2a$10$hashed_password_here", // Use bcrypt to hash
  fullName: "Admin User",
  isAdmin: true,
  isActive: true,
  balance: 0,
  referralCode: "ADMIN001",
  createdAt: new Date()
})
```

Or use the registration endpoint and manually update the user:

```bash
# After registering normally, update user to admin
db.users.updateOne(
  { email: "youremail@example.com" },
  { $set: { isAdmin: true } }
)
```

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Investment plans are visible
- [ ] Admin panel is accessible
- [ ] Cron jobs are running (check PM2 logs)
- [ ] SSL certificates are installed
- [ ] Database backups are configured
- [ ] Monitoring is set up
- [ ] Email service is configured (if using)

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs greenmax-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart greenmax-api
```

### Database Backups

```bash
# Create backup script
nano /root/backup-mongodb.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --out /backups/mongodb_$DATE
find /backups -type d -mtime +7 -exec rm -rf {} +
```

Make executable and add to cron:
```bash
chmod +x /root/backup-mongodb.sh
crontab -e
# Add: 0 2 * * * /root/backup-mongodb.sh
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs greenmax-api

# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Check environment variables
pm2 env greenmax-api
```

### Frontend API Connection Issues

1. Check CORS settings in backend
2. Verify API_URL in frontend/js/auth.js
3. Check browser console for errors
4. Verify SSL certificates

### Database Connection Issues

```bash
# Test MongoDB connection
mongo greenmax --eval "db.stats()"

# Check MongoDB status
systemctl status mongod

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## Security Recommendations

1. **Change Default Credentials**
   - Update JWT_SECRET to a strong random string
   - Change admin password immediately

2. **Enable Firewall**
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

3. **Regular Updates**
```bash
apt update && apt upgrade -y
npm update
```

4. **Rate Limiting**
   - Already configured in backend
   - Consider adding Cloudflare for DDoS protection

5. **Database Security**
   - Enable MongoDB authentication
   - Use strong passwords
   - Restrict network access

## Scaling

### Horizontal Scaling

1. **Load Balancer Setup**
   - Use Nginx or HAProxy
   - Deploy multiple backend instances
   - Use Redis for session management

2. **Database Replication**
   - Setup MongoDB replica set
   - Configure read replicas

### Vertical Scaling

- Upgrade server resources (CPU, RAM)
- Optimize database queries
- Enable caching (Redis)

## Support

For issues and questions:
- GitHub Issues: https://github.com/ahmad-coder45/green-max-investment-platform/issues
- Email: support@greenmax.com

## License

MIT License - See LICENSE file for details
