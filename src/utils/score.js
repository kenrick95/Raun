export function getScoreColor(percentagePoint) {
  return `hsla(0, ${Math.round(percentagePoint)}%, ${50 +
    Math.round((1 - percentagePoint / 100) * 25)}%, 1);`;
}
