"use client";

import { useState } from "react";
import GameBox from "@/components/GameBox";

const boxes = ["Box 1", "Box 2", "Box 3"];

export default function MysteryBoxPage() {
  const [selectedBox, setSelectedBox] = useState("");

  return (
    <main className="min-h-screen bg-black text-yellow-700 p-10">
      <h1 className="text-6xl font-bold mb-6">
        Mystery Box
      </h1>

      <p className="text-2xl mb-8 text-yellow-500">
        Selected: {selectedBox || "None"}
      </p>

      <div className="grid grid-cols-3 gap-6 mt-10">
        {boxes.map((box) => (
          <GameBox
            key={box}
            label={box}
            selected={selectedBox === box}
            onClick={() => setSelectedBox(box)}
          />
        ))}
      </div>
    </main>
  );
}