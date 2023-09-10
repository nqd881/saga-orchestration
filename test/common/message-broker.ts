import { EventEmitter } from "events";
import DeferredCtor from "promise-deferred";
import { generate } from "randomstring";
import { CommandMessage, CommandMessageWithReplyChannel, ReplyMessage } from "../../src";

export class MessageBroker extends EventEmitter {
  async send(channel: string, message: CommandMessage) {
    const replyChannel = `${channel}.${generate()}`;

    const { promise, resolve, reject } = new DeferredCtor<ReplyMessage>();

    this.once(replyChannel, (replyMessage: ReplyMessage) => {
      console.log("Receive reply on channel", replyChannel);

      resolve(replyMessage);
    });

    this.emit(channel, new CommandMessageWithReplyChannel(message, replyChannel));

    console.log("Broker sending message to channel", channel);

    return promise;
  }
}
