export class Result<T> {
  public isSuccess: boolean;
  public error?: string;
  private _value?: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    this.isSuccess = isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess || !this._value) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }
}