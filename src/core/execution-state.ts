export class ExecutionState {
  static readonly StartState = new ExecutionState(-1, false, false, false);

  public readonly currentStepIndex: number;
  public readonly compensating: boolean;
  public readonly failed: boolean;
  public readonly ended: boolean;

  constructor(
    currentStepIndex: number,
    compensating: boolean,
    failed: boolean,
    ended: boolean,
  ) {
    this.currentStepIndex = currentStepIndex;
    this.compensating = compensating;
    this.failed = failed;
    this.ended = ended;
  }

  next(jump: number) {
    return new ExecutionState(
      this.compensating ? this.currentStepIndex - jump : this.currentStepIndex + jump,
      this.compensating,
      this.failed,
      this.ended,
    );
  }

  end() {
    return new ExecutionState(
      this.currentStepIndex,
      this.compensating,
      this.failed,
      true,
    );
  }

  fail() {
    return new ExecutionState(this.currentStepIndex, this.compensating, true, true);
  }

  startCompensating() {
    return new ExecutionState(this.currentStepIndex, true, false, false);
  }
}
