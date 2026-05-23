type EventCallback = (
  data: unknown
) => void;

class EventBus {
  private listeners =
    new Map<
      string,
      EventCallback[]
    >();

  emit(
    eventName: string,
    data: unknown
  ) {
    const callbacks =
      this.listeners.get(
        eventName
      );

    if (!callbacks) {
      return;
    }

    callbacks.forEach(
      (callback) => {
        callback(data);
      }
    );
  }

  on(
    eventName: string,
    callback: EventCallback
  ) {
    const existing =
      this.listeners.get(
        eventName
      ) || [];

    existing.push(callback);

    this.listeners.set(
      eventName,
      existing
    );
  }

  off(
    eventName: string,
    callback: EventCallback
  ) {
    const existing =
      this.listeners.get(
        eventName
      );

    if (!existing) {
      return;
    }

    this.listeners.set(
      eventName,
      existing.filter(
        (cb) =>
          cb !== callback
      )
    );
  }
}

const globalForEventBus =
  globalThis as typeof globalThis & {
    eventBus?: EventBus;
  };

export const eventBus =
  globalForEventBus.eventBus ??
  new EventBus();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForEventBus.eventBus =
    eventBus;
}