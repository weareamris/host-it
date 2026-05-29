import { NextResponse } from "next/server";
import { eventBus } from "@/server/events/EventBus";

// Simple in-memory event storage (in production, use a database)
const streamEvents = new Map<string, Array<{
  type: string;
  data: any;
  timestamp: string;
  id: string;
}>>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const sinceId = searchParams.get("sinceId");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const events = streamEvents.get(username) || [];
  
  // Filter events after sinceId
  const newEvents = sinceId 
    ? events.filter(e => parseInt(e.id) > parseInt(sinceId))
    : events.slice(-10); // Return last 10 if no sinceId

  return NextResponse.json({
    events: newEvents,
    latestId: events.length > 0 ? events[events.length - 1].id : "0",
  });
}

// Store event
export function storeEvent(username: string, eventType: string, data: any) {
  const events = streamEvents.get(username) || [];
  
  const event = {
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
    id: String(Date.now()),
  };

  events.push(event);
  
  // Keep only last 100 events
  if (events.length > 100) {
    events.shift();
  }

  streamEvents.set(username, events);
}
