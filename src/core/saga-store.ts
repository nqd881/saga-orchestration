import { Saga } from "./saga";

export class SagaStore {
  private store: Map<string, Saga<any>>;

  constructor() {
    this.store = new Map<string, Saga<any>>();
  }

  getSaga<Data>(type: string) {
    const saga = this.store.get(type);

    return saga ? (saga as Saga<Data>) : saga;
  }

  hasSaga(type: string) {
    return Boolean(this.getSaga(type));
  }

  registerSaga<Data>(saga: Saga<Data>) {
    const sagaType = saga.type;

    if (this.hasSaga(sagaType)) throw new Error(`Existing saga with name ${sagaType}`);

    this.store.set(sagaType, saga);
  }
}
