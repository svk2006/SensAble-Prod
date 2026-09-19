import { NormalizedFrame } from '../types/normalized';

export interface TemporalSequenceBufferConfig {
  capacity?: number; // Maximum number of frames to retain in buffer
}

/**
 * Step 11A: Bounded FIFO temporal sequence buffer for normalized hand perception frames.
 *
 * Designed for dynamic sign gesture recognition modeling.
 * Completely independent of React.
 * Does NOT mutate frames pushed to it.
 */
export class TemporalSequenceBuffer {
  private buffer: NormalizedFrame[] = [];
  private maxCapacity: number;

  constructor(config?: TemporalSequenceBufferConfig | number) {
    const cap = typeof config === 'number' ? config : config?.capacity;
    this.maxCapacity = cap && cap > 0 ? cap : 30;
  }

  /**
   * Pushes a new normalized frame into the buffer.
   * Discards oldest frame if capacity is exceeded.
   */
  public push(frame: NormalizedFrame | null): void {
    if (!frame) {
      return;
    }

    this.buffer.push(frame);

    while (this.buffer.length > this.maxCapacity) {
      this.buffer.shift();
    }
  }

  /**
   * Returns a shallow copy of the current sequence array.
   */
  public getSequence(): NormalizedFrame[] {
    return [...this.buffer];
  }

  /**
   * Clears all frames from the buffer.
   */
  public clear(): void {
    this.buffer = [];
  }

  /**
   * Current number of frames stored in the buffer.
   */
  public get size(): number {
    return this.buffer.length;
  }

  /**
   * Maximum frame capacity of the buffer.
   */
  public get capacity(): number {
    return this.maxCapacity;
  }

  /**
   * Updates maximum capacity and trims excess frames if necessary.
   */
  public setCapacity(newCapacity: number): void {
    if (newCapacity <= 0) {
      return;
    }
    this.maxCapacity = newCapacity;
    while (this.buffer.length > this.maxCapacity) {
      this.buffer.shift();
    }
  }
}
