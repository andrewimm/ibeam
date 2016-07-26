/* @flow */

import Client from './Client';
import type {
  ClientOptions,
  ClonedClient,
  HttpMethod,
  HttpControllerResponse,
  PostProcessor,
} from './Types';

export default function addResponsePostProcessor(
  client: Client,
  processor: PostProcessor
): Client {
  const clone = new Client(client.getConfig());
  const originalRaw = client.raw;
  (clone: ClonedClient).raw = function(
    method: HttpMethod,
    path: string,
    payload: any,
    options: ClientOptions = {}
  ): Promise<HttpControllerResponse> {
    return originalRaw.call(
      this,
      method,
      path,
      payload,
      options
    ).then((response) => {
      return processor(response);
    });
  };

  return clone;
}
