export function scoreDiv(): HTMLElement {
  const score = document.getElementById('score');
  if (!score) {
    throw new Error('#score div does not exist.');
  }
  return score;
}

export function setScore(score: number = 0): void {
  scoreDiv().textContent = `${score}`;
}

export default {
  setScore
};
