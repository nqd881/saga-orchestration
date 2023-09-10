import { Command } from "../command/command.interface";
import { ExecutionState } from "./execution-state";
import { ParticipantInvoker } from "./participant-invocation";

export class SagaAction<Data, C extends Command = Command> {
  public readonly updatedData: Data;
  public readonly updatedState: ExecutionState;
  public readonly nextInvoker?: ParticipantInvoker<Data, C>;

  constructor(
    updatedData: Data,
    updatedState: ExecutionState,
    nextInvoker?: ParticipantInvoker<Data, C>,
  ) {
    this.updatedData = updatedData;
    this.updatedState = updatedState;
    this.nextInvoker = nextInvoker;
  }
}
