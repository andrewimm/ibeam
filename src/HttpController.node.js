/**
 * HttpController for Node.js
 * @flow
 */

import * as http from 'http';
import * as https from 'https';
import { parse } from 'url';

import type { HttpMethod, HttpHeaders, HttpControllerResponse } from './Types';

export function request(
  method: HttpMethod,
  url: string,
  payload: string = '',
  headers: HttpHeaders = {}
): Promise<HttpControllerResponse> {
  let options = {
    ...parse(url),
    method: method,
    headers: headers
  };

  let module = options.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    let req = module.request(options, (res) => {
      res.setEncoding('utf8');
      let chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          response: chunks.join(''),
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (method !== 'GET') {
      req.write(payload);
    }
    req.end();
  });
}
