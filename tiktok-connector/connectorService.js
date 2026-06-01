#!/usr/bin/env node

/**
 * 🎯 TikTok Connector Service (Standalone Node.js Process)
 * 
 * This runs as a SEPARATE long-running Node.js process that:
 * 1. Automatically connects to TikTok Live streams
 * 2. Listens for gifts and events
 * 3. Exposes REST API endpoints for status checks
 * 4. Does NOT require npm build - runs directly
 * 
 * Start with: node tiktok-connector/index.js
 * Or with pm2: pm2 start tiktok-connector/index.js --name "tiktok-connector"
 */

require("dotenv").config({ path: ".env.local" });

const express = require("express");
const cors = require("cors");
const { WebcastPushConnection } = require("tiktok-live-connector");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.CONNECTOR_PORT || 3001;

// 🔌 Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 📊 Active Connections Map
const activeConnections = new Map();

/**
 * 🎯 Get or Create TikTok Live Connection
 */
function getOrCreateConnection(username) {
  if (activeConnections.has(username)) {
    return activeConnections.get(username);
  }

  const connection = new WebcastPushConnection(username);
  activeConnections.set(username, {
    connection,
    status: "idle",
    roomId: null,
    createdAt: new Date(),
  });

  return connection;
}

/**
 * 🎬 Connect to TikTok Live
 */
async function connectToLive(username) {
  try {
    const entry = activeConnections.get(username);
    if (!entry) return;

    const { connection } = entry;

    console.log(`🔌 Connecting to @${username}...`);

    connection
      .connect()
      .then((state) => {
        entry.status = "connected";
        entry.roomId = state.roomId;
        console.log(`✅ Connected to @${username} (Room: ${state.roomId})`);

        // 📝 Setup Event Listeners
        setupEventListeners(username, connection);
      })
      .catch((err) => {
        entry.status = "error";
        console.error(`❌ Failed to connect to @${username}:`, err.message);
      });
  } catch (error) {
    console.error("Connect error:", error);
  }
}

/**
 * 🎁 Setup Event Listeners for Gifts & Chat
 */
function setupEventListeners(username, connection) {
  // 🎁 Gift Event
  connection.on("gift", async (data) => {
    console.log(
      `🎁 [${username}] ${data.uniqueId} sent ${data.giftName}`
    );

    // Store in Supabase for games to pick up
    try {
      await supabase.from("tiktok_events").insert({
        streamer_name: username,
        event_type: "gift",
        user: data.uniqueId,
        gift_name: data.giftName,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error storing gift event:", err);
    }
  });

  // 💬 Chat Event
  connection.on("chat", async (data) => {
    console.log(`💬 [${username}] @${data.uniqueId}: ${data.comment}`);

    if (data.comment.toLowerCase().startsWith("!")) {
      try {
        await supabase.from("tiktok_events").insert({
          streamer_name: username,
          event_type: "command",
          user: data.uniqueId,
          command: data.comment,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error storing command event:", err);
      }
    }
  });

  // 👤 Follow Event
  connection.on("follow", (data) => {
    console.log(`👤 [${username}] ${data.uniqueId} followed`);
  });

  // ❤️ Like Event
  connection.on("like", (data) => {
    console.log(`❤️ [${username}] ${data.uniqueId} liked (${data.likeCount} likes)`);
  });

  // 🔌 Disconnect Event
  connection.on("disconnected", () => {
    console.log(`🔴 [${username}] Disconnected`);
    const entry = activeConnections.get(username);
    if (entry) {
      entry.status = "disconnected";
    }
  });

  // ⚠️ Error Event
  connection.on("error", (error) => {
    console.error(`❌ [${username}] Error:`, error);
    const entry = activeConnections.get(username);
    if (entry) {
      entry.status = "error";
    }
  });
}

/**
 * 🌐 REST API Endpoints
 */

// ✅ Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 🔴 Check if Streamer is Live
app.post("/api/check-live", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const entry = activeConnections.get(username);

    if (!entry) {
      return res.json({ isLive: false, username });
    }

    const isLive = entry.status === "connected";

    res.json({
      isLive,
      status: entry.status,
      roomId: entry.roomId,
      username,
      connectedAt: entry.createdAt,
    });
  } catch (error) {
    console.error("Check live error:", error);
    res.status(500).json({ error: "Check failed" });
  }
});

// 🚀 Start Connection
app.post("/api/connect", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const cleanUsername = username.toLowerCase().replace("@", "");

    // Create or get connection
    getOrCreateConnection(cleanUsername);

    await connectToLive(cleanUsername);

    res.json({
      success: true,
      username: cleanUsername,
      message: "Connecting to live stream...",
    });
  } catch (error) {
    console.error("Connect endpoint error:", error);
    res.status(500).json({ error: "Connection failed" });
  }
});

// 📋 List Active Connections
app.get("/api/connections", (req, res) => {
  const connections = Array.from(activeConnections.entries()).map(
    ([username, entry]) => ({
      username,
      status: entry.status,
      roomId: entry.roomId,
      connectedAt: entry.createdAt,
    })
  );

  res.json({ connections, total: connections.length });
});

// 🛑 Disconnect
app.post("/api/disconnect", (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const entry = activeConnections.get(username);

    if (entry) {
      entry.connection.disconnect();
      activeConnections.delete(username);
    }

    res.json({ success: true, username });
  } catch (error) {
    console.error("Disconnect error:", error);
    res.status(500).json({ error: "Disconnect failed" });
  }
});

/**
 * 🚀 Start Server
 */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎮 TikTok Connector Service         ║
║   ✅ Running on http://localhost:${PORT}    ║
║   📡 Listening for TikTok streams...  ║
╚════════════════════════════════════════╝
  `);
});

/**
 * 🛑 Graceful Shutdown
 */
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down connector service...");

  activeConnections.forEach((entry) => {
    entry.connection.disconnect();
  });

  process.exit(0);
});

module.exports = app;
