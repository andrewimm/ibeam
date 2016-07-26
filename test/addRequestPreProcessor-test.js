'use strict';

import { expect } from 'chai';
import addRequestPreProcessor from '../src/addRequestPreProcessor';
import Client from '../src/Client';
import MockHTTP from './helpers/MockHTTP';

suite('addRequestPreProcessor', () => {
  test('wrapping raw requests', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      format: 'json',
      httpController: controller,
    });
    let wrapped = addRequestPreProcessor(client, (method, path, payload, options) => {
      return {
        method: method,
        path: path,
        payload: payload,
        options: {headers: {'X-Auth': 'secret'}, ...options},
      };
    });
    return wrapped.raw('GET', '/1/profile', {details: 'true'}).then(() => {
      expect(controller.lastRequest().method).to.equal('GET');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile?details=true');
      expect(controller.lastRequest().payload).to.equal('');
      expect(controller.lastRequest().headers).to.deep.equal({'x-auth': 'secret'});
    });
  });

  test('explicit methods are wrapped', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      format: 'json',
      httpController: controller,
    });
    let wrapped = addRequestPreProcessor(client, (method, path, payload, options) => {
      return {
        method: method,
        path: path,
        payload: payload,
        options: {headers: {'X-Auth': 'secret'}, ...options},
      };
    });
    return wrapped.post('/1/photo', {data: 'abc123'}).then(() => {
      expect(controller.lastRequest().method).to.equal('POST');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/photo');
      expect(controller.lastRequest().payload).to.equal('{"data":"abc123"}');
      expect(controller.lastRequest().headers).to.deep.equal({
        'x-auth': 'secret',
        'content-type': 'application/json',
      });
    });
  });
});
