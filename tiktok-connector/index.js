require("dotenv").config();

const { WebcastPushConnection } = require("tiktok-live-connector");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔥 DYNAMIC STREAMER USERNAME (from .env or default)
const tiktokUsername = process.env.TIKTOK_USERNAME || "s1lvabull3tgaming";

// 📌 DYNAMIC SESSION ID (can be overridden via env)
const sessionId = process.env.SESSION_ID || "session-a";

console.log(`🎬 Starting TikTok connector for: @${tiktokUsername}`);

const tiktokLive = new WebcastPushConnection(tiktokUsername);

console.log("Connecting to TikTok Live...");

tiktokLive
  .connect()
  .then((state) => {
    console.log(`✅ Connected to room ${state.roomId}`);
    console.log(`📊 Room ID: ${state.roomId}`);
    console.log(`🎤 Streamer: ${tiktokUsername}`);
  })
  .catch((err) => {
    console.error("❌ Failed to connect", err);
  });

/**
 * 💬 CHAT COMMANDS (ONLY CONTROLLER CAN ACT)
 */
tiktokLive.on("chat", async (data) => {
  const comment = data.comment.toLowerCase();

  console.log(`[CHAT] ${data.uniqueId}: ${data.comment}`);

  if (comment.startsWith("open ")) {
    console.log(
      `${data.uniqueId} attempted command: ${comment}`
    );

    const { data: controllerData } = await supabase
      .from("game_control")
      .select("*")
      .eq("session_id", sessionId)
      .order("queue_position", { ascending: true })
      .limit(1);

    const controller = controllerData?.[0];

    if (!controller) return;

    if (controller.username !== data.uniqueId) {
      console.log("Not active controller");
      return;
    }

    const { error } = await supabase
      .from("game_commands")
      .insert({
        session_id: sessionId,
        username: data.uniqueId,
        command_text: comment,
        processed: false,
      });

    if (error) {
      console.log("Command insert error:", error);
    } else {
      console.log("Command inserted successfully");
    }
  }
});

/**
 * 🎁 GIFT → QUEUE SYSTEM WITH GAME ACTION
 */
tiktokLive.on("gift", async (data) => {
  console.log(
    `[GIFT] ${data.uniqueId} sent ${data.giftName}`
  );

  const giftPower = {
    Rose: 1,
    Galaxy: 3,
    Lion: 5,
  };

  const moves = giftPower[data.giftName];

  if (!moves) {
    console.log(`[GIFT] ${data.giftName} is not a trigger gift (no moves assigned)`);
    return;
  }

  // get current queue
  const { data: existingQueue } = await supabase
    .from("game_control")
    .select("*")
    .eq("session_id", sessionId)
    .order("queue_position", { ascending: true });

  const nextPosition = (existingQueue?.length || 0) + 1;

  console.log(
    `${data.uniqueId} joined queue position ${nextPosition}`
  );

  // 🎯 INSERT CONTESTANT INTO GAME CONTROL
  const { error, data: insertedData } = await supabase.from("game_control").insert({
    session_id: sessionId,
    username: data.uniqueId,
    gift_name: data.giftName,
    streamer_name: tiktokUsername,  // ✅ FIX: Store streamer name
    active: true,
    moves_remaining: moves,
    queue_position: nextPosition,
  });

  if (error) {
    console.log("❌ Queue insert error:", error);
  } else {
    console.log(
      `✅ ${data.uniqueId} queued with ${moves} moves (Position: ${nextPosition})`
    );

    // 🎯 TRIGGER GAME ACTION - Emit trigger to action contestant control
    try {
      const { error: triggerError } = await supabase
        .from("game_events")
        .insert({
          session_id: sessionId,
          event_type: "gift_trigger",
          gift_name: data.giftName,
          username: data.uniqueId,
          streamer_name: tiktokUsername,  // ✅ FIX: Include streamer name
          action_status: "pending",
          created_at: new Date().toISOString(),
        });

      if (triggerError) {
        console.log("⚠️ Gift trigger event insert error:", triggerError);
      } else {
        console.log(
          `🎯 Gift trigger event created for ${data.uniqueId}'s ${data.giftName}`
        );
      }
    } catch (eventErr) {
      console.error("❌ Failed to create gift trigger event:", eventErr);
    }
  }
});

/**
 * 📊 BASIC EVENTS
 */
tiktokLive.on("member", (data) => {
  console.log(`[JOIN] ${data.uniqueId} joined (Level: ${data.userLevel})`);
});

tiktokLive.on("like", (data) => {
  console.log(`[LIKE] ${data.uniqueId} liked`);
});

tiktokLive.on("follow", (data) => {
  console.log(`[FOLLOW] ${data.uniqueId} followed`);
});

/**
 * 🔌 CONNECTION EVENTS
 */
tiktokLive.on("disconnected", () => {
  console.log("❌ Disconnected from TikTok Live");
});

tiktokLive.on("error", (error) => {
  console.error("❌ TikTok Live Error:", error);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down TikTok connector...");
  tiktokLive.disconnect();
  process.exit(0);
});
