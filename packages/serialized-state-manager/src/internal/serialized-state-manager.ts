import {SerializedStateManagerV0} from '..';

export class SerializedStateManager implements SerializedStateManagerV0 {
  public register(_createSerializedState: () => string | undefined): void {
    throw new Error('Method not implemented.');
  }

  public getSerializedState(): string | undefined {
    throw new Error('Method not implemented.');
  }

  public createSerializedStates(): string {
    throw new Error('Method not implemented.');
  }

  public setSerializedStates(_serializedStates: string): void {
    throw new Error('Method not implemented.');
  }
}
