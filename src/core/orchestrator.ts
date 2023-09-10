import { v4 } from "uuid";
import { SagaAction } from "./action";
import { ExecutionState } from "./execution-state";
import { ISagaCommandProducer } from "./interfaces/saga-command-producer.interface";
import { ISagaInstanceRepo } from "./interfaces/saga-instance-repo.interface";
import { ParticipantReply } from "./participant-reply";
import { SagaInstance } from "./saga-instance";
import { SagaRef } from "./saga-ref";
import { SagaStore } from "./saga-store";

export class Orchestrator {
  protected sagaStore: SagaStore;
  protected sagaInstanceRepo: ISagaInstanceRepo;
  protected sagaCommandProducer: ISagaCommandProducer;

  constructor(
    sagaStore: SagaStore,
    sagaInstanceRepo: ISagaInstanceRepo,
    sagaCommandProducer: ISagaCommandProducer,
  ) {
    this.sagaStore = sagaStore;
    this.sagaInstanceRepo = sagaInstanceRepo;
    this.sagaCommandProducer = sagaCommandProducer;
  }

  private getSaga<Data>(type: string) {
    const saga = this.sagaStore.getSaga<Data>(type);

    if (!saga) throw new Error("Saga not found");

    return saga;
  }

  async create<Data>(sagaType: string, data: Data) {
    const saga = this.getSaga<Data>(sagaType);

    const newInstance = new SagaInstance(
      saga.type,
      v4(),
      data,
      ExecutionState.StartState,
    );

    await this.sagaInstanceRepo.save(newInstance);

    const action = saga.flow.start(data);

    this.processAction(newInstance, action);
  }

  async handleReply<R>(sagaRef: SagaRef, reply: ParticipantReply<R>) {
    const saga = this.getSaga(sagaRef.type);

    const sagaInstance = await this.sagaInstanceRepo.find(sagaRef.type, sagaRef.id, saga);

    if (!sagaInstance) return;

    const action = saga.flow.handleReply(
      sagaInstance.getState(),
      sagaInstance.getData(),
      reply,
    );

    this.processAction(sagaInstance, action);
  }

  private async processAction<Data>(
    sagaInstance: SagaInstance<Data>,
    action: SagaAction<Data>,
  ) {
    const { updatedData, updatedState, nextInvoker } = action;

    if (updatedData) sagaInstance.updateData(updatedData);
    if (updatedState) sagaInstance.updateState(updatedState);

    await this.sagaInstanceRepo.save(sagaInstance);

    if (nextInvoker) {
      const command = nextInvoker(sagaInstance.getData());

      this.sagaCommandProducer.sendCommand(
        this,
        SagaRef.fromInstance(sagaInstance),
        command,
      );
    }
  }
}
