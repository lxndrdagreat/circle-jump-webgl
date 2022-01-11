interface Timer {
  callback: () => void;
  remaining: number;
  uid: number;
}

export class TimersSystem {
  private static _instance: TimersSystem | null = null;
  private timers: Timer[] = [];
  private timerUid: number = 0;

  static get shared(): TimersSystem {
    if (TimersSystem._instance === null) {
      TimersSystem._instance = new TimersSystem();
    }

    return TimersSystem._instance;
  }

  stopAll(activateCallbacks: boolean = false): void {
    if (activateCallbacks) {
      for (const timer of this.timers) {
        timer.callback();
      }
    }

    this.timers = [];
  }

  processTimers(delta: number): void {
    // FIXME: do a better loop
    for (const timer of this.timers) {
      timer.remaining -= delta;
      if (timer.remaining <= 0) {
        timer.callback();
        this.timers.splice(this.timers.indexOf(timer), 1);
      }
    }
  }

  add(seconds: number, callback: () => void): number {
    const timer = {
      remaining: seconds,
      callback: callback,
      uid: ++this.timerUid
    };
    this.timers.push(timer);
    return timer.uid;
  }

  stop(uid: number): boolean {
    const index = this.timers.findIndex((timer) => timer.uid === uid);
    if (index) {
      this.timers.splice(index, 1);
      return true;
    }
    return false;
  }
}
