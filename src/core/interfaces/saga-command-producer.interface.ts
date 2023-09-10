import { Orchestrator } from "../orchestrator";
import { ParticipantCommand } from "../participant-command";
import { SagaRef } from "../saga-ref";

export interface ISagaCommandProducer {
  sendCommand(
    orchestrator: Orchestrator,
    sagaRef: SagaRef,
    command: ParticipantCommand,
  ): void;
}
