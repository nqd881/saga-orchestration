import { v4 } from "uuid";
import { SagaInstance } from "./saga-instance";

export class SagaRef {
  readonly type: string;
  readonly id: string;

  constructor(type: string, id: string) {
    this.type = type;
    this.id = id;
  }

  static new(type: string) {
    return new SagaRef(type, v4());
  }

  static fromInstance(instance: SagaInstance) {
    return new SagaRef(instance.getType(), instance.getId());
  }
}
