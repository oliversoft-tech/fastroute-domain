export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  constructor(props: T, id?: string) {
    this._id = id || this.generateId();
    this.props = props;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public equals(entity?: Entity<T>): boolean {
    if (!entity) return false;
    if (this === entity) return true;
    return this._id === entity._id;
  }

  get id(): string {
    return this._id;
  }
}