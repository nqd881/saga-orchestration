import { Flow } from "#core/flow";
import { ParticipantCommandBuilder } from "#core/participant-command";
import { Saga } from "#core/saga";
import { Command } from "#command/command.interface";
import {
  CreateAccountCommand,
  CreateUserCommand,
  DeleteAccountCommand,
  DeleteUserCommand,
  LinkUserToAccountCommand,
} from "./commands";
import { CreateAccountReply, CreateUserReply } from "./reply";
import { Channels } from "./channels";

export interface AccountDetails {
  accountId: string;
  emailAddress: string;
}

export interface UserDetails {
  userId: string;
  name: string;
}

export interface RegisterSagaInput {
  email: string;
  username: string;
  password: string;
  name: string;
}

export class RegisterSagaData {
  protected input: RegisterSagaInput;
  protected accountDetails?: AccountDetails;
  protected userDetails?: UserDetails;

  constructor(
    input: RegisterSagaInput,
    accountDetails?: AccountDetails,
    userDetails?: UserDetails,
  ) {
    this.input = input;
    this.accountDetails = accountDetails;
    this.userDetails = userDetails;
  }

  getInput() {
    return this.input;
  }

  getAccountDetails() {
    return this.accountDetails;
  }

  getUserDetails() {
    return this.userDetails;
  }

  setAccountDetails(accountDetails: AccountDetails) {
    this.accountDetails = accountDetails;

    return this;
  }

  setUserDetails(userDetails: UserDetails) {
    this.userDetails = userDetails;

    return this;
  }
}

export class RegisterSaga extends Saga<RegisterSagaData> {
  constructor() {
    super("Register", RegisterSaga.getFlow());
  }

  static getFlow() {
    return Flow.step<RegisterSagaData>()
      .invokeParticipant(this.createAccount)
      .onReply(CreateAccountReply.name, this.handleCreateAccountReply)
      .withCompensation(this.deleteAccount)
      .step()
      .invokeParticipant(this.createUser)
      .onReply(CreateUserReply.name, this.handleCreateUserReply)
      .withCompensation(this.deleteUser)
      .step()
      .invokeParticipant(this.linkUserToAccount)
      .buildFlow();
  }

  static getCommandBuilder<C extends Command>() {
    return new ParticipantCommandBuilder<C>();
  }

  static createAccount<Data extends RegisterSagaData>(data: Data) {
    const { email, username, password } = data.getInput();

    const builder = RegisterSaga.getCommandBuilder();

    return builder
      .send(new CreateAccountCommand(email, username, password))
      .to(Channels.AccountService)
      .build();
  }

  static handleCreateAccountReply(data: RegisterSagaData, reply: CreateAccountReply) {
    return data.setAccountDetails({
      accountId: reply.accountId,
      emailAddress: reply.emailAddress,
    });
  }

  static deleteAccount(data: RegisterSagaData) {
    const accountDetails = data.getAccountDetails();

    if (!accountDetails) throw new Error("Account details not found");

    const builder = RegisterSaga.getCommandBuilder();

    return builder
      .send(new DeleteAccountCommand(accountDetails.accountId))
      .to(Channels.AccountService)
      .build();
  }

  static createUser(data: RegisterSagaData) {
    const { name } = data.getInput();

    const builder = RegisterSaga.getCommandBuilder();

    return builder.send(new CreateUserCommand(name)).to(Channels.UserService).build();
  }

  static handleCreateUserReply(data: RegisterSagaData, reply: CreateUserReply) {
    return data.setUserDetails({
      userId: reply.userId,
      name: reply.name,
    });
  }

  static deleteUser(data: RegisterSagaData) {
    const userDetails = data.getUserDetails();

    if (!userDetails) throw new Error("User details not found");

    const builder = RegisterSaga.getCommandBuilder();

    return builder
      .send(new DeleteUserCommand(userDetails.userId))
      .to(Channels.UserService)
      .build();
  }

  static linkUserToAccount(data: RegisterSagaData) {
    const accountDetails = data.getAccountDetails();
    const userDetails = data.getUserDetails();

    if (!accountDetails) throw new Error("Account details not found");
    if (!userDetails) throw new Error("User details not found");

    const builder = RegisterSaga.getCommandBuilder();

    return builder
      .send(new LinkUserToAccountCommand(accountDetails.accountId, userDetails.userId))
      .to(Channels.AccountService)
      .build();
  }
}
