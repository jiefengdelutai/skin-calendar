export function nearestPlanDay(rows, now = new Date()) {
  if (!rows.length) return 0;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let closest = 0;
  let shortest = Infinity;
  rows.forEach((row, index) => {
    const parts = row[0].trim().split('-').map(Number);
    const distance = Math.abs(Date.UTC(parts[0], parts[1] - 1, parts[2]) - today);
    if (distance < shortest) {
      shortest = distance;
      closest = index;
    }
  });
  return closest;
}
