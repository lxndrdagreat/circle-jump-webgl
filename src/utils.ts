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
