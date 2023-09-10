import { Class } from "type-fest";

export interface MessageHeaders {
  [key: string]: any;
}

export interface MessageBody {
  [key: string]: any;
}

export class Message<
  Headers extends MessageHeaders = MessageHeaders,
  Body extends MessageBody = MessageBody,
> {
  protected readonly headers: Headers;
  protected readonly body: Body;

  constructor(headers: Headers, body: Body) {
    this.headers = headers;
    this.body = body;
  }

  getHeaders() {
    return this.headers;
  }

  getBody() {
    return this.body;
  }

  static builder() {
    return new MessageBuilder();
  }
}

export class MessageBuilder<
  Headers extends MessageHeaders = MessageHeaders,
  Body extends MessageBody = MessageBody,
> {
  protected headers?: Headers;
  protected body?: Body;

  withHeaders(headers: Headers) {
    this.headers = headers;

    return this;
  }

  withBody(body: Body) {
    this.body = body;

    return this;
  }

  build() {
    return new Message(this.headers || {}, this.body || {});
  }
}
