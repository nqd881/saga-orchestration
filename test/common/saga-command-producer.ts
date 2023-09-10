import {
  CommandMessage,
  ISagaCommandProducer,
  Orchestrator,
  ParticipantCommand,
  ParticipantReply,
  ParticipantReplyStatus,
  ReplyMessage,
  ReplyMessageOutcome,
  SagaRef,
} from "../../src";
import { MessageBroker } from "./message-broker";

export class SagaCommandProducer implements ISagaCommandProducer {
  constructor(private broker: MessageBroker) {}

  sendCommand(
    sagaOrchestrator: Orchestrator,
    sagaRef: SagaRef,
    participantCommand: ParticipantCommand,
  ): void {
    const { participant, command } = participantCommand;

    const replyMessagePromise = this.broker.send(
      participant,
      new CommandMessage(
        { commandType: command.getCommandType() },
        { commandContent: command },
      ),
    );

    replyMessagePromise.then((replyMessage: ReplyMessage) => {
      console.log("Reply message", replyMessage);

      const { replyOutcome, replyType } = replyMessage.getHeaders();
      const { replyContent } = replyMessage.getBody();

      sagaOrchestrator.handleReply(
        sagaRef,
        new ParticipantReply(
          participant,
          replyOutcome === ReplyMessageOutcome.Success
            ? ParticipantReplyStatus.SuccessStatus
            : ParticipantReplyStatus.FailureStatus,
          replyType,
          replyContent,
        ),
      );
    });
  }
}
