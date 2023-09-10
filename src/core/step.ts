import { Command } from "#command/command.interface";
import { generate } from "randomstring";
import { FlowBuilder } from "./flow";
import {
  ParticipantInvocation,
  ParticipantInvoker,
  ParticipantReplyHandler,
  ParticipantReplyHandlersMap,
} from "./participant-invocation";

export class Step<
  Data,
  ActionCommand extends Command = Command,
  CompensationCommand extends Command = Command,
> {
  protected readonly name: string;
  protected readonly action?: ParticipantInvocation<Data, ActionCommand>;
  protected readonly compensation?: ParticipantInvocation<Data, CompensationCommand>;

  constructor(
    name: string,
    action?: ParticipantInvocation<Data, ActionCommand>,
    compensation?: ParticipantInvocation<Data, CompensationCommand>,
  ) {
    this.name = name;
    this.action = action;
    this.compensation = compensation;
  }

  getName() {
    return this.name;
  }

  hasAction() {
    return Boolean(this.action);
  }

  hasCompensation() {
    return Boolean(this.compensation);
  }

  private getInvocation(compensating: boolean) {
    return compensating ? this.compensation : this.action;
  }

  getInvoker(compensating: boolean) {
    return this.getInvocation(compensating)?.getInvoker();
  }

  getReplyHandler(compensating: boolean, replyType: string) {
    return this.getInvocation(compensating)?.getReplyHandler(replyType);
  }
}

export class StepBuilder<
  Data,
  ActionCommand extends Command = Command,
  CompensationCommand extends Command = Command,
> {
  protected flowBuilder: FlowBuilder<Data>;

  protected name?: string;
  protected actionInvoker?: ParticipantInvoker<Data, ActionCommand>;
  protected compensationInvoker?: ParticipantInvoker<Data, CompensationCommand>;
  protected actionReplyHandlers: ParticipantReplyHandlersMap<Data>;
  protected compensationReplyHandlers: ParticipantReplyHandlersMap<Data>;

  constructor(flowBuilder: FlowBuilder<Data>) {
    this.flowBuilder = flowBuilder;

    this.actionReplyHandlers = new ParticipantReplyHandlersMap();
    this.compensationReplyHandlers = new ParticipantReplyHandlersMap();
  }

  private static generateStepName() {
    return `Step_${generate()}`;
  }

  withName(name?: string) {
    this.name = name;

    return this;
  }

  invokeParticipant(invoker: ParticipantInvoker<Data, ActionCommand>): this {
    this.actionInvoker = invoker;

    return this;
  }

  withCompensation(invoker: ParticipantInvoker<Data, CompensationCommand>) {
    this.compensationInvoker = invoker;

    return this;
  }

  onReply<R>(replyType: string, replyHandler: ParticipantReplyHandler<Data, R>) {
    if (this.compensationInvoker) {
      this.compensationReplyHandlers.addReplyHandler(replyType, replyHandler);
    } else if (this.actionInvoker) {
      this.actionReplyHandlers.addReplyHandler(replyType, replyHandler);
    }

    return this;
  }

  buildStep() {
    const name = this.name || StepBuilder.generateStepName();

    const action = this.actionInvoker
      ? new ParticipantInvocation(this.actionInvoker, this.actionReplyHandlers)
      : undefined;

    const compensation = this.compensationInvoker
      ? new ParticipantInvocation(
          this.compensationInvoker,
          this.compensationReplyHandlers,
        )
      : undefined;

    return new Step<Data, ActionCommand, CompensationCommand>(name, action, compensation);
  }

  private addStepToFlowBulider() {
    const step = this.buildStep();

    this.flowBuilder.addStep(step);
  }

  step(name?: string) {
    this.addStepToFlowBulider();

    return new StepBuilder(this.flowBuilder).withName(name);
  }

  buildFlow() {
    this.addStepToFlowBulider();

    return this.flowBuilder.build();
  }
}
