import { DEG_TO_RAD } from '@pixi/math';

export type SimpleVector2 = { x: number; y: number };
export type SimpleRect = SimpleVector2 & { width: number; height: number };

export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  static fromRotation(radians: number): Vector2 {
    // return new Vector2(Math.cos(radians), Math.sin(radians));
    return new Vector2(Math.cos(radians), Math.sin(radians));
  }

  static copyFrom(other: Vector2 | SimpleVector2): Vector2 {
    return new Vector2(other.x, other.y);
  }

  multiply(amount: number): Vector2 {
    return new Vector2(this.x * amount, this.y * amount);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  angleBetween(other: Vector2 | SimpleVector2): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  distanceFrom(other: Vector2 | SimpleVector2): number {
    return distanceBetweenVectors(this, other);
  }

  moveTowards(other: Vector2 | SimpleVector2, distance: number): Vector2 {
    const angle = this.angleBetween(other);
    const diff = this.distanceFrom(other);
    // console.log(angle, diff, distance, this.x + Math.cos(angle) * distance);
    return new Vector2(
      this.x + Math.cos(angle) * (distance < diff ? distance : diff),
      this.y + Math.sin(angle) * (distance < diff ? distance : diff)
    );
  }
}

export function toRadians(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

export function distanceBetweenVectors(
  a: Vector2 | SimpleVector2,
  b: Vector2 | SimpleVector2
): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(list: T[]): T {
  if (list.length === 0) {
    throw new Error('Cannot choose from empty list.');
  }
  return list[randomInt(0, list.length)];
}

/**
 * Cubic interpolation based on https://github.com/osuushi/Smooth.js
 */
export function clipInput(k: number, arr: number[]): number {
  if (k < 0) k = 0;
  if (k > arr.length - 1) k = arr.length - 1;
  return arr[k];
}

export function getTangent(k: number, factor: number, array: number[]) {
  return (factor * (clipInput(k + 1, array) - clipInput(k - 1, array))) / 2;
}

export function cubicInterpolation(
  array: number[],
  t: number,
  tangentFactor: number = 1
) {
  const k = Math.floor(t);
  const m = [
    getTangent(k, tangentFactor, array),
    getTangent(k + 1, tangentFactor, array)
  ];
  const p = [clipInput(k, array), clipInput(k + 1, array)];
  t -= k;
  const t2 = t * t;
  const t3 = t * t2;
  return (
    (2 * t3 - 3 * t2 + 1) * p[0] +
    (t3 - 2 * t2 + t) * m[0] +
    (-2 * t3 + 3 * t2) * p[1] +
    (t3 - t2) * m[1]
  );
}
