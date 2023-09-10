export class ParticipantReplyStatus {
  static SuccessStatus = new ParticipantReplyStatus("success");
  static FailureStatus = new ParticipantReplyStatus("failure");

  private constructor(public readonly value: string) {}

  isSuccessStatus() {
    return this === ParticipantReplyStatus.SuccessStatus;
  }

  isFailureStatus() {
    return this === ParticipantReplyStatus.FailureStatus;
  }
}

export class ParticipantReply<R = any> {
  readonly participant: string;
  readonly replyStatus: ParticipantReplyStatus;
  readonly replyType?: string;
  readonly replyContent?: R;

  constructor(
    participant: string,
    replyStatus: ParticipantReplyStatus,
    replyType?: string,
    replyContent?: R,
  ) {
    this.participant = participant;
    this.replyStatus = replyStatus;
    this.replyType = replyType;
    this.replyContent = replyContent;
  }
}
