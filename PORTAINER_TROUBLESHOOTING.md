# Portainer Deployment Troubleshooting Guide

## Current Issue: Server Unhealthy

### Step 1: Fix Environment Variables (CRITICAL)

Your environment variables are formatted incorrectly. In Portainer:

1. **Go to your stack** → Click "Editor"
2. **Scroll to Environment Variables section**
3. **Delete ALL existing environment variables**
4. **Add each one individually** using the "+ Add environment variable" button:

| Name | Value |
|------|-------|
| CLIENT_PORT | 8080 |
| SERVER_PORT | 5003 |
| JWT_SECRET | f81de9815c7d41fc01b2194ecb5b50cacd6fbb66c000e8b8e64ff2f337e15aabcfcbf00930145fa32f006e0c36a105fcb0a1d354069c7c0f1ec8232a77bb209d |
| SMTP_HOST | smtp.gmail.com |
| SMTP_PORT | 587 |
| SMTP_USER | mysistersclosetreceipts@gmail.com |
| SMTP_PASS | vgiljfhyutjcuims |
| SMTP_FROM | mysistersclosetreceipts@gmail.com |
| CLIENT_URL | http://192.168.1.230:8080 |

**DO NOT paste them all at once - add each one separately!**

### Step 2: Pull Latest Changes

Before redeploying, you need to get the updated docker-compose.yml with longer health check timeout:

1. **Commit and push** the changes from your local machine:
   ```bash
   git add docker-compose.yml
   git commit -m "Increase health check timeout"
   git push
   ```

2. **In Portainer**, click "Pull and redeploy" or update the stack

### Step 3: Check Container Logs

If the server is still unhealthy after fixing environment variables:

1. **Go to Portainer** → **Containers**
2. **Click on `msc-receipt-server`**
3. **Click "Logs"** tab
4. **Look for error messages**

#### Common Error Messages and Solutions:

**Error: "EADDRINUSE" or "port already in use"**
- Solution: Change `SERVER_PORT` to a different port (e.g., 5004, 5005)

**Error: "Cannot find module" or "MODULE_NOT_FOUND"**
- Solution: The build failed. Go to stack → "Pull and redeploy" to rebuild

**Error: "SMTP connection failed" or email errors**
- Solution: This won't prevent startup - the app will still work, just email won't send
- Check your Gmail App Password is correct

**Error: "Database locked" or "SQLITE_BUSY"**
- Solution: Delete the volume. In Portainer → Volumes → find and delete `msc-receipt-webapp_database.sqlite`

**No errors, but health check still fails:**
- Solution: Server might be taking longer to start. Wait 2-3 minutes and check again

### Step 4: Manual Health Check Test

If the container is running but showing unhealthy:

1. **In Portainer** → **Containers** → **msc-receipt-server**
2. **Click "Console"**
3. **Connect** with `/bin/sh` or `/bin/bash`
4. **Run this command:**
   ```bash
   curl http://localhost:5002/health
   ```

**Expected output:**
```json
{"status":"healthy","timestamp":"2025-...","uptime":123.456,"service":"msc-receipt-server"}
```

**If curl command fails:**
- The server isn't actually running or crashed
- Check logs for startup errors

**If curl succeeds but health check still fails:**
- Health check timing issue
- Wait a bit longer or increase `start_period` in docker-compose.yml

### Step 5: Start Fresh (Last Resort)

If nothing works:

1. **Delete the stack completely** in Portainer
2. **Delete associated volumes:**
   - Go to Volumes
   - Delete any volumes starting with `msc-receipt-webapp`
3. **Recreate the stack** with correct environment variables
4. **Wait 3-5 minutes** for first build

### Step 6: Verify Network Access

Make sure your ports are accessible:

1. **On your server**, check if ports are listening:
   ```bash
   sudo netstat -tlnp | grep 5003
   sudo netstat -tlnp | grep 8080
   ```

2. **Check firewall:**
   ```bash
   sudo ufw status
   # If ports are blocked, allow them:
   sudo ufw allow 5003
   sudo ufw allow 8080
   ```

## Quick Deployment Checklist

- [ ] Committed and pushed latest changes to git
- [ ] Environment variables added ONE BY ONE in Portainer (not pasted together)
- [ ] Stack name is unique (not same as other app)
- [ ] Ports 5003 and 8080 are available (not used by other apps)
- [ ] Waited at least 2-3 minutes after deployment for health checks
- [ ] Checked container logs if unhealthy

## Getting Help

If you're still stuck, provide:
1. Screenshot of container logs (Portainer → Containers → msc-receipt-server → Logs)
2. Screenshot of environment variables in Portainer
3. Output of: `docker ps -a | grep msc-receipt`
4. Output of: `sudo netstat -tlnp | grep -E '5003|8080'`

## Success Indicators

✅ **Healthy deployment:**
- Both `msc-receipt-server` and `msc-receipt-client` show green "healthy" status
- Can access http://192.168.1.230:8080 in browser
- Can create a donation and receive a receipt
- Can login to admin panel at http://192.168.1.230:8080/admin
