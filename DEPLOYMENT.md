# Quick Deployment Guide for Portainer

## What Changed
This app now has proper health checks and configurable ports for Portainer deployment.

## Pre-Deployment Checklist

- [ ] Commit and push all changes to your Git repository
- [ ] Have your SMTP credentials ready (for email receipts)
- [ ] Know your server's IP address
- [ ] Choose an available port (default: 8080)

## Deploy to Portainer (5 Steps)

### Step 1: Access Portainer
Open your Portainer instance: `http://your-server-ip:9000`

### Step 2: Create Stack
1. Click **Stacks** in sidebar
2. Click **Add stack**
3. Enter stack name: `msc-receipt-webapp`

### Step 3: Configure Repository
- **Build method**: Repository
- **Repository URL**: `https://github.com/ajgrego/MSC-Receipt-WebApp` (your repo)
- **Repository reference**: `refs/heads/main`
- **Compose path**: `docker-compose.yml`

### Step 4: Set Environment Variables
Click "Add environment variable" for each:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| CLIENT_PORT | 8080 | Port for web access (change if needed) |
| SERVER_PORT | 5002 | Backend port (usually don't change) |
| JWT_SECRET | <random_string> | Run: `openssl rand -base64 32` |
| SMTP_HOST | smtp.gmail.com | Your email server |
| SMTP_PORT | 587 | Usually 587 for Gmail |
| SMTP_USER | your-email@gmail.com | Your email |
| SMTP_PASS | your-app-password | Gmail App Password |
| SMTP_FROM | your-email@gmail.com | Sender email |
| CLIENT_URL | http://192.168.1.100:8080 | Your server IP + CLIENT_PORT |

**Important**: Replace `192.168.1.100` in CLIENT_URL with your actual server IP!

### Step 5: Deploy
1. Click **Deploy the stack**
2. Wait 1-2 minutes for build and health checks
3. Go to **Containers** view
4. Verify both containers show as **healthy** (green)

## Access Your Application

Open your browser to: `http://your-server-ip:8080`

Default admin credentials:
- Username: `sandy` / Password: `MSCreceipts`
- Username: `kate` / Password: `MSCreceipts`
- Username: `anthony` / Password: `MSCreceipts`

**⚠️ Change these passwords before production use!**

## Troubleshooting

### Health Checks Failing
1. Click on the unhealthy container
2. Click **Logs**
3. Look for error messages
4. Common issues:
   - Missing environment variables
   - Wrong CLIENT_URL
   - SMTP credentials incorrect (email will fail but app still works)

### Can't Access Application
- Check CLIENT_PORT is not already in use
- Verify firewall allows the port
- Check CLIENT_URL matches your server's actual IP

### Server Shows "Can't Connect"
- Edit CLIENT_URL environment variable
- Make sure it uses your actual server IP and CLIENT_PORT
- Redeploy the stack

## Updating After Changes

1. Push changes to git repository
2. In Portainer, go to your stack
3. Click **Pull and redeploy**
4. Wait for health checks to pass

## Monitoring

**Check Health Status:**
- Portainer → Containers
- Both `msc-server` and `msc-client` should show **healthy**
- If unhealthy, check container logs

**View Logs:**
- Portainer → Containers
- Click on container name
- Click **Logs**

## Port Configuration

The app uses these ports by default:
- **8080**: Client/Web interface (configurable)
- **5002**: Server/API (configurable)

To use different ports, change the environment variables:
```
CLIENT_PORT=3000  (any available port)
SERVER_PORT=5002  (usually keep as is)
```

Don't forget to update CLIENT_URL to match CLIENT_PORT!

## Quick Test Checklist

After deployment:
- [ ] Containers show as "healthy" in Portainer
- [ ] Can access app at http://your-server-ip:8080
- [ ] Can create a cash donation
- [ ] Can create an in-kind donation
- [ ] Can login to admin panel
- [ ] Email receipts work (if SMTP configured)

## Need Help?

Check the full [README.md](README.md) for:
- Detailed configuration options
- Security considerations
- Advanced troubleshooting
- Database management
