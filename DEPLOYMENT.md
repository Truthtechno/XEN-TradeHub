# CoreFX Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- **Node.js** 18.0 or later
- **PostgreSQL** 13 or later (or managed database)
- **Domain name** and SSL certificate
- **Environment variables** configured

## 🌐 Deployment Platforms

### Vercel (Recommended)

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Enable automatic deployments

2. **Environment Variables**
   Set the following in Vercel dashboard:
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/database
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-secret-key
   JWT_SECRET=your-jwt-secret
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Deploy**
   - Push to main branch triggers automatic deployment
   - Monitor build logs in Vercel dashboard

### Railway

1. **Create New Project**
   - Connect GitHub repository
   - Select "Deploy from GitHub"

2. **Configure Database**
   - Add PostgreSQL service
   - Copy connection string to DATABASE_URL

3. **Set Environment Variables**
   - Add all required environment variables
   - Deploy automatically

### DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Select Node.js buildpack

2. **Configure Database**
   - Add managed PostgreSQL database
   - Update DATABASE_URL

3. **Set Environment Variables**
   - Configure all required variables
   - Deploy

### Docker Deployment

1. **Build Image**
   ```bash
   docker build -t corefx .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="postgresql://..." \
     -e NEXTAUTH_SECRET="..." \
     corefx
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/corefx
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         - POSTGRES_DB=corefx
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

## 🗄️ Database Setup

### Production Database

1. **Create Database**
   ```sql
   CREATE DATABASE corefx_production;
   CREATE USER corefx_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE corefx_production TO corefx_user;
   ```

2. **Run Migrations**
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Seed Data** (Optional)
   ```bash
   npm run db:seed
   ```

### Database Providers

#### Supabase
- **Setup**: Create new project
- **Connection**: Use connection string from dashboard
- **Backups**: Automatic daily backups

#### PlanetScale
- **Setup**: Create new database
- **Connection**: Use connection string
- **Scaling**: Automatic scaling

#### AWS RDS
- **Setup**: Create PostgreSQL instance
- **Security**: Configure VPC and security groups
- **Monitoring**: CloudWatch monitoring

## 🔐 Security Configuration

### SSL/TLS
- **Let's Encrypt**: Free SSL certificates
- **Cloudflare**: Additional security layer
- **AWS Certificate Manager**: For AWS deployments

### Environment Security
```env
# Production environment variables
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-secret-key
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=postgresql://user:pass@host:port/database?sslmode=require
```

### Security Headers
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

## 📊 Monitoring & Analytics

### Application Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: User session replay

### Database Monitoring
- **PostgreSQL Stats**: Query performance monitoring
- **Connection Pooling**: PgBouncer for connection management
- **Backup Monitoring**: Automated backup verification

### Uptime Monitoring
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **StatusPage**: Public status page

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Environment-Specific Deployments
- **Staging**: `staging.corefx.com`
- **Production**: `corefx.com`
- **Preview**: Feature branch deployments

## 📈 Performance Optimization

### Next.js Optimizations
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
}
```

### CDN Configuration
- **Vercel Edge Network**: Global CDN
- **Cloudflare**: Additional caching
- **AWS CloudFront**: Custom CDN setup

### Database Optimization
- **Connection Pooling**: PgBouncer
- **Query Optimization**: Index optimization
- **Caching**: Redis for session storage

## 🔧 Maintenance

### Regular Tasks
- **Database Backups**: Daily automated backups
- **Security Updates**: Regular dependency updates
- **Performance Monitoring**: Weekly performance reviews
- **Log Rotation**: Automated log management

### Backup Strategy
```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# File backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

### Health Checks
- **API Health**: `/api/health`
- **Database Health**: Connection status
- **External Services**: Stripe, Google OAuth status

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all environment variables
   - Review build logs for specific errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database server status
   - Review connection limits

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET
   - Check OAuth configuration
   - Review JWT token expiration

4. **Payment Issues**
   - Verify Stripe keys (test vs live)
   - Check webhook endpoints
   - Review payment logs

### Debug Commands
```bash
# Check application status
curl https://your-domain.com/api/health

# Test database connection
npm run db:status

# Verify environment variables
npm run env:check
```

## 📞 Support

### Monitoring Alerts
- **Uptime**: Immediate alerts for downtime
- **Errors**: Real-time error notifications
- **Performance**: Threshold-based alerts

### Emergency Procedures
1. **Rollback**: Revert to previous deployment
2. **Database Recovery**: Restore from backup
3. **Service Restart**: Restart application services

---

**Need help?** Check the [Development Guide](./DEVELOPMENT.md) or [API Documentation](./API.md)
