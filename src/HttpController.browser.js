/**
 * HttpController for XMLHttpRequest
 * @flow
 */

import type { HttpMethod, HttpHeaders, HttpControllerResponse } from './Types';

export function request(
  method: HttpMethod,
  url: string,
  payload: string = '',
  headers: HttpHeaders = {}
): Promise<HttpControllerResponse> {
  if (typeof XMLHttpRequest === 'undefined') {
    throw new Error(
      'XMLHttpRequest does not exist. ' +
      'If you\'re using Node, you should use the Node HTTP Controller:\n' +
      '  import HttpController from \'ibeam/http-node\''
    );
  }
  const xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status === 0) {
        return reject('Unable to connect to the server');
      }
      return resolve({
        status: xhr.status,
        response: xhr.responseText,
      });
    }
  });

  xhr.open(method, url, true);
  for (let h in headers) {
    xhr.setRequestHeader(h, headers[h]);
  }
  xhr.send(payload);

  return promise;
}
