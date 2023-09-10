import { generate } from "randomstring";
import { v4 } from "uuid";
import { MessageBroker } from "./message-broker";
import {
  CommandMessage,
  CommandMessageWithReplyChannel,
} from "#messaging/command-message";
import {
  CreateAccountCommand,
  CreateUserCommand,
  DeleteAccountCommand,
  DeleteUserCommand,
  LinkUserToAccountCommand,
} from "./commands";
import { ReplyMessage, ReplyMessageOutcome } from "#messaging/reply-message";
import { CreateAccountReply, CreateUserReply } from "./reply";
import { Channels } from "./channels";

export class Account {
  public id: string;
  public linkedUserId: string;

  constructor(
    public emailAddress: string,
    public username: string,
    public password: string,
  ) {
    this.id = v4();
    this.emailAddress = this.emailAddress.toUpperCase();
  }

  linkWithUser(userId: string) {
    this.linkedUserId = userId;
  }
}

export class Repo<T extends { id: string }> {
  records: Map<string, T> = new Map<string, T>();

  async save(instance: T) {
    this.records.set(instance.id, instance);
  }

  async find(id: string) {
    return this.records.get(id);
  }

  async delete(id: string) {
    this.records.delete(id);
  }
}

export class User {
  public id: string;

  constructor(public name: string = generate()) {
    this.id = v4();
  }
}

export class AccountRepo extends Repo<Account> {}

export class UserRepo extends Repo<User> {}

export class AccountRemoteService {
  accountRepo: AccountRepo = new AccountRepo();

  constructor(private broker: MessageBroker) {
    this.broker.on(
      Channels.AccountService,
      async (commandMessageWithReplyChannel: CommandMessageWithReplyChannel) => {
        console.log(
          "Account Service received command message with reply channel",
          commandMessageWithReplyChannel,
        );

        const commandMessage = commandMessageWithReplyChannel.getMessage();
        const replyChannel = commandMessageWithReplyChannel.getReplyChannel();

        const { commandType } = commandMessage.getHeaders();
        const { commandContent } = commandMessage.getBody();

        switch (commandType) {
          case CreateAccountCommand.name: {
            const command = commandContent as CreateAccountCommand;

            try {
              const newAccount = await this.createAccount({
                emailAddress: command.emailAddress,
                username: command.username,
                password: command.password,
              });

              this.broker.emit(
                replyChannel,
                new ReplyMessage<CreateAccountReply>(
                  {
                    replyOutcome: ReplyMessageOutcome.Success,
                    replyType: CreateAccountReply.name,
                  },
                  {
                    replyContent: {
                      accountId: newAccount.id,
                      emailAddress: newAccount.emailAddress,
                    },
                  },
                ),
              );
            } catch (error) {
              this.broker.emit(
                replyChannel,
                ReplyMessage.builder()
                  .withHeaders({
                    replyOutcome: ReplyMessageOutcome.Failure,
                  })
                  .build(),
              );
            }

            break;
          }

          case DeleteAccountCommand.name: {
            const command = commandContent as DeleteAccountCommand;

            try {
              await this.deleteAccount({
                accountId: command.accountId,
              });

              this.broker.emit(
                replyChannel,
                new ReplyMessage({ replyOutcome: ReplyMessageOutcome.Success }, {}),
              );
            } catch (error) {
              this.broker.emit(
                replyChannel,
                new ReplyMessage({ replyOutcome: ReplyMessageOutcome.Failure }, {}),
              );
            }

            break;
          }

          case LinkUserToAccountCommand.name: {
            const command = commandContent as LinkUserToAccountCommand;

            try {
              await this.linkUserToAccount({
                accountId: command.accountId,
                userId: command.userId,
              });

              // throw new Error("Link user to account wrong");

              this.broker.emit(
                replyChannel,
                new ReplyMessage({ replyOutcome: ReplyMessageOutcome.Success }, {}),
              );
            } catch (error) {
              this.broker.emit(
                replyChannel,
                new ReplyMessage({ replyOutcome: ReplyMessageOutcome.Failure }, {}),
              );
            }

            break;
          }
        }
      },
    );
  }

  async createAccount(params: {
    emailAddress: string;
    username: string;
    password: string;
  }) {
    const newAccount = new Account(params.emailAddress, params.username, params.password);

    this.accountRepo.save(newAccount);

    return newAccount;
  }

  async deleteAccount(params: { accountId: string }) {
    this.accountRepo.delete(params.accountId);
  }

  async linkUserToAccount(params: { accountId: string; userId: string }) {
    const account = await this.accountRepo.find(params.accountId);

    if (!account) return;

    account.linkWithUser(params.userId);

    await this.accountRepo.save(account);
  }
}

export class UserRemoteService {
  userRepo: UserRepo = new UserRepo();

  constructor(private broker: MessageBroker) {
    this.broker.on(
      Channels.UserService,
      async (commandMessageWithReplyChannel: CommandMessageWithReplyChannel) => {
        console.log(
          "User Service received command message with reply channel",
          commandMessageWithReplyChannel,
        );

        const commandMessage = commandMessageWithReplyChannel.getMessage();
        const replyChannel = commandMessageWithReplyChannel.getReplyChannel();

        const { commandType } = commandMessage.getHeaders();
        const { commandContent } = commandMessage.getBody();

        switch (commandType) {
          case CreateUserCommand.name: {
            const command = commandContent as CreateUserCommand;

            try {
              const newUser = await this.createUser({
                name: command.name,
              });

              this.broker.emit(
                replyChannel,
                new ReplyMessage<CreateUserReply>(
                  {
                    replyOutcome: ReplyMessageOutcome.Success,
                    replyType: CreateUserReply.name,
                  },
                  {
                    replyContent: {
                      userId: newUser.id,
                      name: newUser.name,
                    },
                  },
                ),
              );
            } catch (error) {
              this.broker.emit(
                replyChannel,
                new ReplyMessage({ replyOutcome: ReplyMessageOutcome.Failure }, {}),
              );
            }

            break;
          }
          case DeleteUserCommand.name: {
            const command = commandContent as DeleteUserCommand;

            try {
              await this.deleteUser({ userId: command.userId });

              this.broker.emit(
                replyChannel,
                new ReplyMessage({ replyOutcome: ReplyMessageOutcome.Success }, {}),
              );
            } catch (error) {
              this.broker.emit(
                replyChannel,
                new ReplyMessage({ replyOutcome: ReplyMessageOutcome.Failure }, {}),
              );
            }

            break;
          }
        }
      },
    );
  }

  async createUser(params: { name?: string }) {
    const newUser = new User(params?.name);

    this.userRepo.save(newUser);

    return newUser;
  }

  async deleteUser(params: { userId: string }) {
    this.userRepo.delete(params.userId);
  }
}
