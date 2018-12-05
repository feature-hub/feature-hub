export type PromiseStatus = 'new' | 'pending' | 'final';

export type Onfulfilled<TValue, TResult> = ((
  value: TValue
) => TResult | PromiseLike<TResult>);

export type Onrejected<TResult> = ((
  reason: unknown
) => TResult | PromiseLike<TResult>);

export class PromiseWithStatus<TResult> {
  private _status: PromiseStatus = 'new';

  public constructor(private readonly promise: Promise<TResult>) {}

  public get status(): PromiseStatus {
    return this._status;
  }

  public then<TResult1 = TResult, TResult2 = never>(
    onfulfilled?: Onfulfilled<TResult, TResult1> | undefined | null,
    onrejected?: Onrejected<TResult2> | undefined | null
  ): Promise<TResult1 | TResult2> {
    this._status = 'pending';

    return this.promise.then(
      onfulfilled &&
        (value => {
          this._status = 'final';

          return onfulfilled(value);
        }),
      onrejected &&
        (reason => {
          this._status = 'final';

          return onrejected(reason);
        })
    );
  }
}
