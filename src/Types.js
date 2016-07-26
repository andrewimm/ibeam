/* @flow */

export type ClientOptions = {
  https?: boolean,
  host?: string,
  headers?: HttpHeaders,
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type HttpHeaders = { [header: string]: string };
export type HttpController = {
  request(
    method: HttpMethod,
    url: string,
    payload: string,
    headers: HttpHeaders
  ): Promise<HttpControllerResponse>,
};
export type HttpControllerResponse = {
  status: number,
  response: string,
};

export type ClonedClient = {
  raw: (
    method: HttpMethod,
    path: string,
    payload: any,
    options: ClientOptions | void,
  ) => Promise<HttpControllerResponse>,
};

export type PreProcessorResponse = {
  method?: HttpMethod,
  path?: string,
  payload?: any,
  options?: ClientOptions,
};
export type PreProcessor = (
  method: HttpMethod,
  path: string,
  payload: any,
  options: ClientOptions
) => PreProcessorResponse;

export type PostProcessor = (
  response: HttpControllerResponse
) => HttpControllerResponse | Promise<HttpControllerResponse>;
