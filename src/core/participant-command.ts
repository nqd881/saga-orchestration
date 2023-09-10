import { Command } from "#command/command.interface";

export class ParticipantCommand<C extends Command = Command> {
  readonly participant: string;
  readonly command: C;

  constructor(participant: string, command: C) {
    this.participant = participant;
    this.command = command;
  }
}

export class ParticipantCommandBuilder<C extends Command = Command> {
  private participant: string;
  private command: C;

  constructor() {}

  send(command: C) {
    this.command = command;

    return this;
  }

  to(participant: string) {
    this.participant = participant;

    return this;
  }

  build() {
    return new ParticipantCommand(this.participant, this.command);
  }
}
