import {TimersSystem} from './systems/timers.system';

export function scoreDiv(): HTMLElement {
  const score = document.getElementById('score');
  if (!score) {
    throw new Error('#score div does not exist.');
  }
  return score;
}

export function startOverlayDiv(): HTMLElement {
  const startDiv = document.getElementById('start-overlay');
  if (!startDiv) {
    throw new Error('#start-overlay div does not exist.');
  }
  return startDiv;
}

export function setScore(score: number = 0): void {
  // scoreDiv().textContent = `${score}`;
  scoreDiv().querySelector('span')!.textContent = `${score}`;
  scoreDiv().classList.add('pulse');
  TimersSystem.shared.add(.5, () => {
    scoreDiv().classList.remove('pulse');
  });
}

export function setShowStart(show: boolean): void {
  if (show) {
    startOverlayDiv().classList.remove('hide');
  } else {
    startOverlayDiv().classList.add('hide');
  }
}

export default {
  setScore,
  setShowStart
};
