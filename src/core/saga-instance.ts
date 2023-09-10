import { ExecutionState } from "./execution-state";

export class SagaInstance<Data = any> {
  protected type: string;
  protected id: string;
  protected data: Data;
  protected state: ExecutionState;

  constructor(type: string, id: string, data: Data, state: ExecutionState) {
    this.type = type;
    this.id = id;
    this.data = data;
    this.state = state;
  }

  getType() {
    return this.type;
  }

  getId() {
    return this.id;
  }

  getData() {
    return this.data;
  }

  getState() {
    return this.state;
  }

  updateData(data: Data) {
    this.data = data;

    return this;
  }

  updateState(state: ExecutionState) {
    this.state = state;

    return this;
  }
}
