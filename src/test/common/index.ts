import { Orchestrator } from "#core/orchestrator";
import { SagaStore } from "#core/saga-store";
import { InMemorySagaInstanceRepo } from "./in-memory-saga-instance-repo";
import { MessageBroker } from "./message-broker";
import { RegisterSaga, RegisterSagaData, RegisterSagaInput } from "./register-saga";
import { AccountRemoteService, UserRemoteService } from "./remote-service";
import { SagaCommandProducer } from "./saga-command-producer";

const broker = new MessageBroker();

const accountRemoteService = new AccountRemoteService(broker);
const userRemoteService = new UserRemoteService(broker);

//
//

const sagaStore = new SagaStore();

const registerSaga = new RegisterSaga();

sagaStore.registerSaga(registerSaga);

//

const sagaCommandProducer = new SagaCommandProducer(broker);

//

const sagaInstanceRepo = new InMemorySagaInstanceRepo();

const orchestrator = new Orchestrator(sagaStore, sagaInstanceRepo, sagaCommandProducer);

const registerInput: RegisterSagaInput = {
  email: "quocdaitinls@gmail.com",
  username: "quocdaitinls",
  password: "abc123",
  name: "QuocDai",
};

orchestrator.create(registerSaga.type, new RegisterSagaData(registerInput));

setTimeout(() => {
  console.log(sagaInstanceRepo.records.values());
  console.log(userRemoteService.userRepo.records.values());
  console.log(accountRemoteService.accountRepo.records.values());
}, 3000);
