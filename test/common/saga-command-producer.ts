import { Orchestrator } from "#core/orchestrator";
import { ParticipantCommand } from "#core/participant-command";
import { SagaRef } from "#core/saga-ref";
import { CommandMessage } from "#messaging/command-message";
import { MessageBroker } from "./message-broker";
import { ParticipantReply, ParticipantReplyStatus } from "#core/participant-reply";
import { ReplyMessage, ReplyMessageOutcome } from "#messaging/reply-message";
import { ISagaCommandProducer } from "#core/interfaces/saga-command-producer.interface";

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
