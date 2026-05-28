import { NextResponse } from "next/server";

import { generateGameBoard } from "@/lib/gameEngine";

export async function GET() {

  const boxes =
    generateGameBoard();

  return NextResponse.json({
    success: true,
    boxes,
  });
}