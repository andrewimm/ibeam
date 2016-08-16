/* @flow */

import * as Encoding from './Encoding';
import type {
  HttpController,
  HttpControllerResponse,
  HttpMethod,
  ClientOptions
} from './Types';

export default class Client {
  _useHttps: boolean;
  _host: string;
  _httpController: HttpController;
  _defaultFormat: string;

  constructor(config: {[opt: string]: any}) {
    if (!config || typeof config !== 'object') {
      throw new Error('Cannot initialize a Client without a configuration object');
    }
    this._useHttps = config.https === false ? false : true;
    this._host = config.host;
    if (this._host && this._host.startsWith('http://')) {
      if (config.https !== true) {
        this._useHttps = false;
      }
      this._host = this._host.substr(0, 7);
    }
    this._httpController = config.hasOwnProperty('httpController') ?
      config.httpController :
      require('./HttpController.browser');
    this._defaultFormat = config.hasOwnProperty('format') ?
      config.format :
      'urlencoded';
  }

  getConfig(): {[opt: string]: any} {
    return {
      https: this._useHttps,
      host: this._host,
      httpController: this._httpController,
      format: this._defaultFormat,
    };
  }

  get(path: string, payload: any, options: ClientOptions = {}) {
    return this.raw('GET', path, payload, options);
  }

  post(path: string, payload: any, options: ClientOptions = {}) {
    return this.raw('POST', path, payload, options);
  }

  put(path: string, payload: any, options: ClientOptions = {}) {
    return this.raw('PUT', path, payload, options);
  }

  patch(path: string, payload: any, options: ClientOptions = {}) {
    return this.raw('PATCH', path, payload, options);
  }

  delete(path: string, payload: any, options: ClientOptions = {}) {
    return this.raw('DELETE', path, payload, options);
  }

  raw(
    method: HttpMethod,
    path: string,
    payload: any,
    options: ClientOptions = {}
  ): Promise<HttpControllerResponse> {
    let format = this._defaultFormat;
    if (method === 'GET') {
      format = 'urlencoded';
    }
    if (options.format) {
      format = options.format;
    }
    let encoded = {
      type: 'text/plain',
      body: typeof payload === 'string' ? payload : '',
    };
    const useHttps = options.hasOwnProperty('https') ? !!options.https : this._useHttps;
    const host = options.host || this._host;
    let url = 'http' + (useHttps ? 's' : '') + '://' + host;
    if (url.endsWith('/')) {
      url = url.substr(0, url.length - 1);
    }
    if (path[0] !== '/') {
      url += '/';
    }
    url += path;
    if (options.format || (payload && typeof payload !== 'string')) {
      switch (format) {
        case 'urlencoded':
          encoded = Encoding.urlencoded(payload);
          break;
        case 'json':
          encoded = Encoding.json(payload);
          break;
        case 'multipart':
          encoded = Encoding.multipart(payload);
          break;
        case 'plain':
          encoded = Encoding.plain(payload);
          break;
        default:
          return Promise.reject(new Error('Unsupported format: ' + format));
      }
    }
    let body = encoded.body;
    if (method === 'GET') {
      if (encoded.body) {
        url += '?' + encoded.body;
      }
      body = '';
    }
    const headers = {};
    if (options.headers) {
      for (let header in options.headers) {
        headers[header.toLowerCase()] = options.headers[header];
      }
    }
    if (method !== 'GET' && !headers['content-type']) {
      headers['content-type'] = encoded.type;
    }

    return this._httpController.request(method, url, body, headers);
  }
}
