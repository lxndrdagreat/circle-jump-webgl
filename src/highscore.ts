export function setHighscore(score: number): void {
  if (window.localStorage) {
    window.localStorage.setItem('highscore', score.toString());
  }
}

export function getHighscore(): number {
  if (!window.localStorage) {
    return 0;
  }
  try {
    const score = window.localStorage.getItem('highscore');
    if (!score) {
      return 0;
    }
    return parseInt(score);
  } catch (_e) {
    return 0;
  }
}

export default {
  setHighscore,
  getHighscore
};
