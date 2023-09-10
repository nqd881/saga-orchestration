import { Command } from "../../src/index";

export class CommandBase implements Command {
  getCommandType(): string {
    return this.constructor.name;
  }
}

export class CreateUserCommand extends CommandBase {
  readonly name: string;

  constructor(name: string) {
    super();

    this.name = name;
  }
}

export class DeleteUserCommand extends CommandBase {
  readonly userId: string;

  constructor(userId: string) {
    super();

    this.userId = userId;
  }
}

export class CreateAccountCommand extends CommandBase {
  readonly emailAddress: string;
  readonly username: string;
  readonly password: string;

  constructor(emailAddress: string, username: string, password: string) {
    super();

    this.emailAddress = emailAddress;
    this.username = username;
    this.password = password;
  }
}

export class DeleteAccountCommand extends CommandBase {
  readonly accountId: string;

  constructor(accountId: string) {
    super();

    this.accountId = accountId;
  }
}

export class LinkUserToAccountCommand extends CommandBase {
  readonly accountId: string;
  readonly userId: string;

  constructor(accountId: string, userId: string) {
    super();

    this.accountId = accountId;
    this.userId = userId;
  }
}
