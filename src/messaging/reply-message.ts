import { Message, MessageBody, MessageHeaders } from "./message";

export enum ReplyMessageOutcome {
  Success = "success",
  Failure = "failure",
}

export interface ReplyMessageHeaders {
  replyOutcome: ReplyMessageOutcome;
  replyType?: string;
}

export interface ReplyMessageBody<R> extends MessageBody {
  replyContent?: R;
}

export class ReplyMessage<
  R = any,
  Headers extends ReplyMessageHeaders = ReplyMessageHeaders,
  Body extends ReplyMessageBody<R> = ReplyMessageBody<R>,
> extends Message<Headers, Body> {
  isSuccessReply() {
    return this.headers.replyOutcome === ReplyMessageOutcome.Success;
  }

  isFailureReply() {
    return this.headers.replyOutcome === ReplyMessageOutcome.Failure;
  }
}
