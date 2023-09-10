import { ISagaInstanceRepo } from "#core/interfaces/saga-instance-repo.interface";
import { SagaInstance } from "#core/saga-instance";
import { Nullable } from "#utils/types";
import { Promisable } from "type-fest";

export class InMemorySagaInstanceRepo implements ISagaInstanceRepo {
  records: Map<string, SagaInstance<any>>;

  constructor() {
    this.records = new Map<string, SagaInstance<any>>();
  }

  find<Data>(type: string, id: string): Promisable<Nullable<SagaInstance<Data>>> {
    const key = this.encodeKey(type, id);

    const instance = this.records.get(key);

    return instance ?? null;
  }

  save<Data>(instance: SagaInstance<Data>): Promisable<void> {
    const key = this.encodeKey(instance.getType(), instance.getId());

    this.records.set(key, instance);
  }

  private encodeKey(type: string, id: string) {
    return `${type}_${id}`;
  }

  private decodeKey(key: string) {
    const [type, id] = key.split("_");

    return { type, id };
  }
}
