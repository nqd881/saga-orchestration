import { Flow } from "./flow";

export class Saga<Data> {
  readonly type: string;
  readonly flow: Flow<Data>;

  constructor(type: string, flow: Flow<Data>) {
    this.type = type;
    this.flow = flow;
  }

  static builder() {
    return new SagaBuilder();
  }
}

export class SagaBuilder<Data> {
  private type: string;
  private flow: Flow<Data>;

  constructor() {}

  withType(type: string) {
    this.type = type;

    return this;
  }

  withFlow(flow: Flow<Data>) {
    this.flow = flow;

    return this;
  }

  build() {
    return new Saga(this.type, this.flow);
  }
}
