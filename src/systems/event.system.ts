export type EventType = 'JumperCaptured';

export class EventSystem {
  private static _instance: EventSystem | null = null;
  private _subscriptions: Map<EventType, CallableFunction[]> = new Map<
    EventType,
    Function[]
  >();

  static get shared(): EventSystem {
    if (EventSystem._instance === null) {
      EventSystem._instance = new EventSystem();
    }

    return EventSystem._instance;
  }

  // TODO: add unsubscribe
  connect(event: EventType, listener: CallableFunction): void {
    const list = this._subscriptions.get(event) || [];
    list.push(listener);
    this._subscriptions.set(event, list);
  }

  trigger(event: EventType, ...eventArgs: unknown[]): void {
    const list = this._subscriptions.get(event) || [];
    for (const listener of list) {
      listener(eventArgs);
    }
  }

  removeAllListeners(): void {
    this._subscriptions.clear();
  }
}
