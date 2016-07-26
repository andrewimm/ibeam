/* @flow */

import Client from './Client';
import type {
  ClientOptions,
  ClonedClient,
  HttpMethod,
  HttpControllerResponse,
  PreProcessor,
} from './Types';

export default function addRequestPreProcessor(
  client: Client,
  processor: PreProcessor
): Client {
  const clone = new Client(client.getConfig());
  const originalRaw = client.raw;
  (clone: ClonedClient).raw = function(
    method: HttpMethod,
    path: string,
    payload: any,
    options: ClientOptions = {}
  ): Promise<HttpControllerResponse> {
    const merged = {method, path, payload, options};
    const mutated = processor(method, path, payload, options);
    for (let key in mutated) {
      merged[key] = mutated[key];
    }
    return originalRaw.call(
      this,
      merged.method,
      merged.path,
      merged.payload,
      merged.options
    );
  };

  return clone;
}
