# Nginx Reverse Proxy Setup for NeuralNova File Server

## 🎯 Why Nginx Proxy?

**Problem**: Browser blocks HTTPS page from loading HTTP resources (Mixed Content Error)

**Solution**: Use Nginx to proxy HTTPS requests to internal HTTP Node.js server

```
Browser → https://neuralnova.space/fileserver/* (HTTPS)
         ↓
      Nginx (SSL termination)
         ↓
      http://localhost:3000/* (HTTP internal)
```

---

## 📝 Setup Instructions

### Step 1: Locate Nginx Config

Find your current Nginx site configuration:

```bash
# Common locations:
ls /etc/nginx/sites-available/
ls /etc/nginx/conf.d/

# For neuralnova.space:
nano /etc/nginx/sites-available/neuralnova.space
# OR
nano /etc/nginx/conf.d/neuralnova.conf
```

### Step 2: Add Proxy Configuration

Inside the `server { ... }` block (the one with `ssl` settings), add:

```nginx
server {
    listen 443 ssl http2;
    server_name neuralnova.space www.neuralnova.space;
    
    # ... existing SSL configuration ...
    
    # Backend API (existing)
    location /backend/ {
        # ... your existing backend config ...
    }
    
    # ==== ADD THIS: File Server Proxy ====
    
    # File upload endpoints
    location /fileserver/ {
        # Remove /fileserver prefix and forward to Node.js
        rewrite ^/fileserver/(.*) /$1 break;
        
        # Proxy to Node.js server on port 3000
        proxy_pass http://localhost:3000;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Upload size limits
        client_max_body_size 100M;
        client_body_buffer_size 128k;
        
        # Timeouts for large uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Disable buffering for large uploads
        proxy_request_buffering off;
        proxy_buffering off;
    }
    
    # Uploaded files serving
    location /uploads/ {
        # Proxy to Node.js server
        proxy_pass http://localhost:3000/uploads/;
        
        # Cache headers for static files
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }
    
    # ==== END FILE SERVER CONFIG ====
    
    # Frontend files (existing)
    location / {
        # ... your existing frontend config ...
    }
}
```

### Step 3: Test Nginx Configuration

```bash
# Test syntax
sudo nginx -t

# Expected output:
# nginx: configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload Nginx

```bash
# Reload Nginx (zero downtime)
sudo systemctl reload nginx

# OR restart if needed
sudo systemctl restart nginx
```

### Step 5: Verify Node.js Server is Running

```bash
# Check if Node.js server is running on port 3000
curl http://localhost:3000/health

# Expected:
# {"success":true,"status":"healthy",...}
```

---

## 🧪 Testing

### 1. Check Nginx Proxy
```bash
# From VPS itself
curl https://neuralnova.space/fileserver/health

# Expected:
# {"success":true,"status":"healthy",...}
```

### 2. Test Upload from Browser

1. Open: `https://neuralnova.space/pages/profile/index.html`
2. Open DevTools Console (F12)
3. Check logs:
   ```
   📁 File Server: https://neuralnova.space/fileserver
   ```
4. Upload avatar
5. Should see:
   ```
   📤 Uploading avatar to Node.js server: ...
   📡 Avatar upload status: 200
   ✅ Profile picture updated!
   ```

---

## 🔍 Troubleshooting

### Issue: 502 Bad Gateway

**Cause**: Node.js server not running

**Fix**:
```bash
cd /path/to/file-server
pm2 status
pm2 restart neuralnova-file-server
```

### Issue: 504 Gateway Timeout

**Cause**: File too large or upload too slow

**Fix**: Increase timeouts in Nginx config (already set to 300s)

### Issue: Still Mixed Content Error

**Cause**: Nginx config not applied

**Fix**:
```bash
sudo nginx -t
sudo systemctl reload nginx
# Clear browser cache (Ctrl + Shift + R)
```

---

## 📊 URL Mapping

| Frontend Call | Nginx Proxy | Node.js Receives |
|--------------|-------------|------------------|
| `https://neuralnova.space/fileserver/upload/avatar` | ✓ | `http://localhost:3000/upload/avatar` |
| `https://neuralnova.space/fileserver/health` | ✓ | `http://localhost:3000/health` |
| `https://neuralnova.space/uploads/avatars/xxx.webp` | ✓ | `http://localhost:3000/uploads/avatars/xxx.webp` |

---

## ✅ Checklist

- [ ] Nginx config updated
- [ ] Nginx syntax test passed (`nginx -t`)
- [ ] Nginx reloaded
- [ ] Node.js server running on port 3000
- [ ] Health check works: `curl https://neuralnova.space/fileserver/health`
- [ ] Frontend updated and pushed
- [ ] Browser cache cleared (Ctrl + Shift + R)
- [ ] Avatar upload tested successfully

---

## 🎓 Benefits of This Setup

1. ✅ **Security**: HTTPS end-to-end (browser sees HTTPS only)
2. ✅ **Simple**: No need to configure SSL in Node.js
3. ✅ **Scalable**: Nginx handles SSL termination efficiently
4. ✅ **Flexible**: Easy to add more Node.js services later
5. ✅ **Standard**: Industry best practice for microservices

---

## 📚 Further Reading

- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [PM2 Process Management](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Mixed Content Explained](https://web.dev/what-is-mixed-content/)
