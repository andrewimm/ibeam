'use strict';

import { expect } from 'chai';
import Client from '../src/Client';
import MockHTTP from './helpers/MockHTTP';

suite('Client', () => {
  test('Client initialization', () => {
    let client = new Client({host: 'example.com'});
    expect(client._httpController).to.exist;
    expect(client._useHttps).to.be.true;
    expect(client._defaultFormat).to.equal('urlencoded');

    client = new Client({host: 'example.com', https: true});
    expect(client._useHttps).to.be.true;

    client = new Client({host: 'example.com', https: false});
    expect(client._useHttps).to.be.false;
  });

  test('GET request defaults to urlencoding', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      format: 'json',
      httpController: controller,
    });
    return client.raw('GET', '/1/profile', {details: 'true'}).then(() => {
      expect(controller.lastRequest().method).to.equal('GET');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile?details=true');
      expect(controller.lastRequest().payload).to.equal('');
      expect(controller.lastRequest().headers).to.deep.equal({});
    });
  });

  test('default format is used', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      format: 'json',
      httpController: controller,
    });
    return client.raw('POST', '/1/uploads', {valid: 'true'}).then(() => {
      expect(controller.lastRequest().method).to.equal('POST');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/uploads');
      expect(controller.lastRequest().payload).to.equal('{"valid":"true"}');
      expect(controller.lastRequest().headers).to.deep.equal({'content-type': 'application/json'});
    });
  });

  test('default format can be overridden', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      format: 'json',
      httpController: controller,
    });
    return client.raw('POST', '/1/uploads', {valid: 'true'}, {format: 'plain'}).then(() => {
      expect(controller.lastRequest().method).to.equal('POST');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/uploads');
      expect(controller.lastRequest().payload).to.equal('valid=true');
      expect(controller.lastRequest().headers).to.deep.equal({'content-type': 'text/plain'});
    });
  });

  test('content type can be overridden', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      format: 'json',
      httpController: controller,
    });
    return client.raw('POST', '/1/uploads', {valid: 'true'}, {headers: {'Content-Type': 'text/plain'}}).then(() => {
      expect(controller.lastRequest().method).to.equal('POST');
      expect(controller.lastRequest().url).to.equal('https://example.com/1/uploads');
      expect(controller.lastRequest().payload).to.equal('{"valid":"true"}');
      expect(controller.lastRequest().headers).to.deep.equal({'content-type': 'text/plain'});
    });
  });

  test('host can be overridden', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      httpController: controller,
    });
    return client.raw('GET', '/files.json', null, {host: 'uploads.example.com'}).then(() => {
      expect(controller.lastRequest().method).to.equal('GET');
      expect(controller.lastRequest().url).to.equal('https://uploads.example.com/files.json');
      expect(controller.lastRequest().headers).to.deep.equal({});
    });
  });

  test('host and path are only joined with one slash', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com/',
      httpController: controller,
    });
    return client.raw('GET', '/1/profile', null).then(() => {
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile');
      return client.raw('GET', '1/profile', null);
    }).then(() => {
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile');
      client._host = 'example.com';
      return client.raw('GET', '1/profile', null);
    }).then(() => {
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile');
      return client.raw('GET', '1/profile', null, {host: 'example.com/'});
    }).then(() => {
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile');
      return client.raw('GET', '/1/profile', null, {host: 'example.com/'});
    }).then(() => {
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile');
    });
  });

  test('https can be overridden', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com/',
      httpController: controller,
    });
    return client.raw('GET', '/1/profile', null, {https: false}).then(() => {
      expect(controller.lastRequest().url).to.equal('http://example.com/1/profile');
      client._useHttps = false;
      return client.raw('GET', '/1/profile', null, {https: true});
    }).then(() => {
      expect(controller.lastRequest().url).to.equal('https://example.com/1/profile');
    });
  });

  test('POST without payload', () => {
    let controller = new MockHTTP([{}]);
    let client = new Client({
      host: 'example.com',
      format: 'json',
      httpController: controller,
    });
    return client.raw('POST', '/1/pages', null).then(() => {
      expect(controller.lastRequest().payload).to.equal('');
      expect(controller.lastRequest().headers).to.deep.equal({'content-type': 'text/plain'});
    });
  });

  test('Invalid format throws an error', () => {
    let client = new Client({
      host: 'example.com'
    });
    return client.raw('POST', '/1/pages', null, {format: 'blah'}).then(() => {
      throw new Error('Should not resolve');
    }, (err) => {
      expect(err.message).to.equal('Unsupported format: blah');
      return Promise.resolve();
    });
  });
});
