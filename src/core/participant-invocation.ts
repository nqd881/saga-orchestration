import { Command } from "src/command/command.interface";
import { ParticipantCommand } from "./participant-command";

export type ParticipantInvoker<Data, C extends Command = Command> = (
  data: Data,
) => ParticipantCommand<C>;

export type ParticipantReplyHandler<Data, Reply = any> = (
  data: Data,
  reply: Reply,
) => Data;

export class ParticipantReplyHandlersMap<Data> extends Map<
  string,
  ParticipantReplyHandler<Data>
> {
  addReplyHandler<R>(replyType: string, replyHandler: ParticipantReplyHandler<Data, R>) {
    return this.set(replyType, replyHandler);
  }
}

export class ParticipantInvocation<Data, C extends Command = Command> {
  protected invoker: ParticipantInvoker<Data, C>;
  protected replyHandlers: ParticipantReplyHandlersMap<Data>;

  constructor(
    invoker: ParticipantInvoker<Data, C>,
    replyHandlers?: ParticipantReplyHandlersMap<Data>,
  ) {
    this.invoker = invoker;
    this.replyHandlers = replyHandlers || new ParticipantReplyHandlersMap();
  }

  hasReplyHandlers() {
    return Boolean(this.replyHandlers?.size);
  }

  getInvoker() {
    return this.invoker;
  }

  getReplyHandler(replyType: string) {
    return this.replyHandlers.get(replyType);
  }
}
