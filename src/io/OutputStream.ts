/**
 * @module OutputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

export abstract class OutputStream {
  public abstract writeByte(byte: number): void;

  public writeBytes(bytes: number[]): void {
    const length: number = bytes.length;

    for (let i: number = 0; i < length; i++) {
      this.writeByte(bytes[i]);
    }
  }

  public flush(): void {
    // The flush method
  }

  public close(): void {
    this.flush();
  }
}
