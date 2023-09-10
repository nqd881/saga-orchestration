import { Promisable } from "type-fest";
import { Nullable } from "#utils/types";
import { SagaInstance } from "#core/saga-instance";
import { Saga } from "#core/saga";

export interface ISagaInstanceRepo {
  find<Data>(
    type: string,
    id: string,
    saga: Saga<Data>,
  ): Promisable<Nullable<SagaInstance<Data>>>;

  save<Data>(instance: SagaInstance<Data>): Promisable<void>;
}
