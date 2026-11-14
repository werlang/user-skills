/** Close an unused relay after 30 minutes; running commands suspend the countdown. */
export class IdleTimeout {
  #active = new Set();
  #timer;
  #expiresAt;
  #close;
  #delay;

  /** @param {Function} close Called once the relay has no active command for delayMs. */
  constructor(close, delayMs = 30 * 60 * 1000) {
    this.#close = close;
    this.#delay = delayMs;
    this.#arm();
  }

  /** Deadline in epoch milliseconds, or null while a command is active. */
  get expiresAt() { return this.#expiresAt; }

  /** Mark a client as active; control/status requests must not call this. */
  begin(client) {
    this.#active.add(client);
    clearTimeout(this.#timer);
    this.#expiresAt = null;
  }

  /** Start a fresh countdown only when the last command client disconnects. */
  end(client) {
    if (this.#active.delete(client) && this.#active.size === 0) this.#arm();
  }

  /** Cancel the timer when the relay shuts down for another reason. */
  cancel() { clearTimeout(this.#timer); }

  /** Keep the relay alive during the idle window, then release Chrome's connection. */
  #arm() {
    clearTimeout(this.#timer);
    this.#expiresAt = Date.now() + this.#delay;
    this.#timer = setTimeout(this.#close, this.#delay);
  }
}
