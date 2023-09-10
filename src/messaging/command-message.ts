import { Command } from "#command/command.interface";
import { Message, MessageBody, MessageHeaders } from "./message";

export interface CommandMessageHeaders {
  commandType: string;
}

export interface CommandMessageBody<C extends Command> extends MessageBody {
  commandContent: C;
}

export class CommandMessage<
  C extends Command = Command,
  H extends CommandMessageHeaders = CommandMessageHeaders,
  B extends CommandMessageBody<C> = CommandMessageBody<C>,
> extends Message<H, B> {}

export class CommandMessageWithReplyChannel {
  protected message: CommandMessage;
  protected replyChannel: string;

  constructor(message: CommandMessage, replyChannel: string) {
    this.message = message;
    this.replyChannel = replyChannel;
  }

  getMessage() {
    return this.message;
  }

  getReplyChannel() {
    return this.replyChannel;
  }
}
