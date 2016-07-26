'use strict';

import { expect } from 'chai';
import * as Encoding from '../src/Encoding';

suite('Encoding', () => {
  test('URL Encoding', () => {
    let url = Encoding.urlencoded({name: 'John Doe', grade: 'A+', completed: '24%'});
    expect(url.type).to.equal('application/x-www-form-urlencoded');
    expect(url.body).to.equal('name=John+Doe&grade=A%2B&completed=24%25');

    url = Encoding.urlencoded({});
    expect(url.body).to.equal('');
  });

  test('JSON Encoding', () => {
    let json = Encoding.json({name: 'John Doe', grade: 'A+'});
    expect(json.type).to.equal('application/json');
    expect(json.body).to.equal('{"name":"John Doe","grade":"A+"}');
  });

  test('Multipart Encoding', () => {
    let multi = Encoding.multipart({name: 'John Doe', grade: 'A+', completed: '24%'});
    expect(multi.type.indexOf('multipart/form-data; boundary=')).to.equal(0);
    let boundary = multi.type.substr(30);
    let content = multi.body.split('\r\n');
    expect(content[0]).to.equal('--' + boundary);
    expect(content[1]).to.equal('Content-Disposition: form-data; name="name"');
    expect(content[2]).to.equal('');
    expect(content[3]).to.equal('John Doe');
    expect(content[4]).to.equal('--' + boundary);
    expect(content[5]).to.equal('Content-Disposition: form-data; name="grade"');
    expect(content[6]).to.equal('');
    expect(content[7]).to.equal('A+');
    expect(content[8]).to.equal('--' + boundary);
    expect(content[9]).to.equal('Content-Disposition: form-data; name="completed"');
    expect(content[10]).to.equal('');
    expect(content[11]).to.equal('24%');
    expect(content[12]).to.equal('--' + boundary + '--');
    expect(content.length).to.equal(13);
  });

  test('Plain Text Encoding', () => {
    let plain = Encoding.plain({name: 'John Doe', grade: 'A+'});
    expect(plain.type).to.equal('text/plain');
    expect(plain.body).to.equal('name=John Doe\r\ngrade=A+');
  });
});
