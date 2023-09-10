import { SagaAction } from "./action";
import { ExecutionState } from "./execution-state";
import { ParticipantReply } from "./participant-reply";
import { Step, StepBuilder } from "./step";

export class Flow<Data> {
  readonly steps: Step<Data>[];

  constructor(steps: Step<Data>[]) {
    this.steps = steps;
  }

  start(data: Data): SagaAction<Data> {
    return this.sagaActionForNextStep(ExecutionState.StartState, data);
  }

  handleReply<R>(
    state: ExecutionState,
    data: Data,
    reply: ParticipantReply<R>,
  ): SagaAction<Data> {
    const currentStepIndex = state.currentStepIndex;

    const currentStep = this.steps[currentStepIndex];

    const { replyType, replyStatus, replyContent } = reply;

    if (replyType) {
      const replyHandler = currentStep.getReplyHandler(state.compensating, replyType);

      if (replyHandler) {
        data = replyHandler(data, replyContent);
      }
    }

    if (replyStatus.isSuccessStatus()) return this.sagaActionForNextStep(state, data);

    if (!state.compensating)
      return this.sagaActionForNextStep(state.startCompensating(), data);

    return this.sagaActionForFailedCompensation(state, data);
  }

  protected sagaActionForFailedCompensation(state: ExecutionState, data: Data) {
    return new SagaAction(data, state.fail());
  }

  protected sagaActionForNextStep(state: ExecutionState, data: Data): SagaAction<Data> {
    let skipped = 0;

    const { compensating, currentStepIndex } = state;
    const direction = compensating ? -1 : +1;

    for (
      let i = currentStepIndex + direction;
      i >= 0 && i < this.steps.length;
      i += direction
    ) {
      skipped++;

      const step = this.steps[i];

      if (compensating ? step.hasCompensation() : step.hasAction()) {
        return new SagaAction(data, state.next(skipped), step.getInvoker(compensating));
      }
    }

    return new SagaAction(data, state.end());
  }

  static builder<Data>() {
    return new FlowBuilder<Data>();
  }

  static step<Data>(name?: string) {
    return new StepBuilder<Data>(this.builder()).withName(name);
  }
}

export class FlowBuilder<Data> {
  protected steps: Step<Data>[];

  constructor() {
    this.steps = [];
  }

  addStep(step: Step<Data>) {
    this.steps.push(step);

    return this;
  }

  build() {
    return new Flow(this.steps);
  }
}
