require("dotenv").config();

const { WebcastPushConnection } = require("tiktok-live-connector");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔥 FIXED STREAM USERNAME
const tiktokUsername = "s1lvabull3tgaming";

const sessionId = "session-a";

const tiktokLive = new WebcastPushConnection(tiktokUsername);

console.log("Connecting to TikTok Live...");

tiktokLive
  .connect()
  .then((state) => {
    console.log(`Connected to room ${state.roomId}`);
  })
  .catch((err) => {
    console.error("Failed to connect", err);
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
 * 🎁 GIFT → QUEUE SYSTEM
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

  if (!moves) return;

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

  const { error } = await supabase.from("game_control").insert({
    session_id: sessionId,
    username: data.uniqueId,
    gift_name: data.giftName,
    active: true,
    moves_remaining: moves,
    queue_position: nextPosition,
  });

  if (error) {
    console.log("Queue insert error:", error);
  } else {
    console.log(
      `${data.uniqueId} queued with ${moves} moves`
    );
  }
});

/**
 * 📊 BASIC EVENTS
 */
tiktokLive.on("member", (data) => {
  console.log(`[JOIN] ${data.uniqueId} joined`);
});

tiktokLive.on("like", (data) => {
  console.log(`[LIKE] ${data.uniqueId} liked`);
});

tiktokLive.on("follow", (data) => {
  console.log(`[FOLLOW] ${data.uniqueId} followed`);
});