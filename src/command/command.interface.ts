import { Class } from "type-fest";

export interface Command {
  getCommandType(): string;
}

export type CommandClass<C extends Command> = Class<C>;
