import { prizeRegistry } from "./prizeRegistry";

export function generateGameBoard() {

  const shuffled =
    [...prizeRegistry].sort(
      () => Math.random() - 0.5
    );

  return shuffled.map(
    (prize, index) => ({
      boxNumber: index + 1,
      prize,
      opened: false,
    })
  );
}

export function getRemainingBoxes(
  boxes: any[]
) {

  return boxes.filter(
    (box) => !box.opened
  );
}