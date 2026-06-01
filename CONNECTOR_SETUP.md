# TikTok Connector Startup Guide

## 📋 Requirements

- Node.js 18+
- TikTok account username
- Supabase credentials

## 🚀 Quick Start (3 Steps)

### Step 1: Copy Environment Variables
```bash
cp tiktok-connector/.env.example tiktok-connector/.env
```

Edit `tiktok-connector/.env`:
```env
TIKTOK_USERNAME=your-tiktok-username
SESSION_ID=session-a
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### Step 2: Install Dependencies (One-time)
```bash
cd tiktok-connector
npm install
cd ..
```

### Step 3: Run Connector (No build needed!)

**Option A: Direct Node.js**
```bash
node tiktok-connector/index.js
```

**Option B: Using PM2 (Recommended for always-on)**
```bash
npm install -g pm2
pm2 start tiktok-connector/index.js --name "tiktok-connector"
pm2 save
pm2 startup
```

**Option C: Run Both Connector & Web Server**
```bash
# Terminal 1: Start TikTok Connector
node tiktok-connector/index.js

# Terminal 2: Start Next.js Web Server (in another terminal)
npm run dev
```

## 🎯 How It Works

### Automatic Flow:
1. **Creator logs in** at `/login`
2. **TikTok username is saved** to their profile
3. **Dashboard page** automatically:
   - Starts the TikTok connector for their username
   - Checks if they're currently live every 10 seconds
   - Shows live status indicator (🔴 LIVE / ⚫ OFFLINE)
4. **When live**, overlays and games **auto-activate**

### Manual Connection (if needed):
```bash
curl -X POST http://localhost:3001/api/connect \
  -H "Content-Type: application/json" \
  -d '{"username":"s1lvabull3tgaming"}'
```

### Check Connections:
```bash
curl http://localhost:3001/api/connections
```

## 📊 No Manual Build Required!

- ✅ `node tiktok-connector/index.js` runs DIRECTLY
- ✅ No `npm run build` needed
- ✅ Changes take effect immediately on restart
- ✅ Terminal stays open and shows logs

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TIKTOK_USERNAME` | Your TikTok live username | `s1lvabull3tgaming` |
| `SESSION_ID` | Game session identifier | `session-a` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anonymous key | `eyJhbG...` |
| `CONNECTOR_PORT` | Optional: API port (default 3001) | `3001` |

## 📱 Dashboard Auto-Activation

When you login:
1. Dashboard detects your TikTok username
2. Connector **auto-starts** for your stream
3. Live status **auto-updates** every 10 seconds
4. When you go **🔴 LIVE**:
   - Games automatically activate
   - Overlay Studio connects
   - Gift triggers start working

## 🎮 Games & Overlay Auto-Integration

Once live and logged in:
- **Beat The Banker** - Click setup, username auto-populates
- **Bingo Caller** - Click setup, username auto-populates
- **Overlay Studio** - Username pre-filled, connections auto-start
- **Mobile Overlay** - Automatically receives your live stream events

## 🔴 Troubleshooting

### Connector won't start?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process on that port
kill -9 <PID>
```

### No events coming through?
- Check `.env` has correct Supabase credentials
- Verify `TIKTOK_USERNAME` matches your actual TikTok username
- Check connector terminal for error messages

### Games not activating?
- Ensure you're logged into the web dashboard
- Check if connector is showing `connected` status
- Verify you're actually live on TikTok

## ✅ Deployment (No Changes Needed!)

Your current setup with Vercel + Supabase already supports this:
- ✅ Connector can run on any server with Node.js
- ✅ Next.js handles the web UI (Vercel)
- ✅ Supabase handles all data (no redeploy needed)
- ✅ Just start the connector on your machine or a VPS

## 🎯 Next Steps

1. Update `.env` with your credentials
2. Start connector: `node tiktok-connector/index.js`
3. Go to web dashboard and login
4. Click "Beat The Banker" or "Bingo" setup
5. Username auto-populates ✅
6. Games connect to your live stream automatically ✅

That's it! No additional deployment needed for the connector! 🚀
