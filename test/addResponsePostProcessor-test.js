'use strict';

import { expect } from 'chai';
import addResponsePostProcessor from '../src/addResponsePostProcessor';
import Client from '../src/Client';
import MockHTTP from './helpers/MockHTTP';

suite('addResponsePostProcessor', () => {
  test('wrapping raw requests', () => {
    let controller = new MockHTTP([
      {status: 500, response: 'Error'},
      {status: 201, response: 'Created'},
    ]);
    let client = new Client({
      host: 'example.com',
      httpController: controller,
    });
    let wrapped = addResponsePostProcessor(client, ({status, response}) => {
      if (status >= 400) {
        return Promise.reject(response);
      }
      return {status, response};
    });
    return wrapped.raw('GET', '/1/profile', {details: 'true'}).then(() => {
      throw new Error('Promise should not be resolved');
    }, (err) => {
      expect(controller.lastRequest().method).to.equal('GET');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile?details=true');
      expect(controller.lastRequest().payload).to.equal('');
      expect(controller.lastRequest().headers).to.deep.equal({});

      expect(err).to.equal('Error');

      return wrapped.raw('POST', '/1/photos', {data: '123'});
    }).then((res) => {
      expect(controller.lastRequest().method).to.equal('POST');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/photos');
      expect(controller.lastRequest().payload).to.equal('data=123');
      expect(controller.lastRequest().headers).to.deep.equal({
        'content-type': 'application/x-www-form-urlencoded'
      });

      expect(res.status).to.equal(201);
      expect(res.response).to.equal('Created');
    });
  });
});
