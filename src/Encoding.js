/* @flow */

type FormData = { [key: string]: string };
type EncodedData = { type: string, body: string };

const QUOTE = /"/g;
const RESERVED = /[!'()*]/g;
const ENCODED_PLUS = /%20/g;

function fullURIEncode(str: string): string {
  return (
    encodeURIComponent(str)
      .replace(ENCODED_PLUS, '+')
      .replace(RESERVED, (c) => '%' + c.charCodeAt(0).toString(16))
  );
}

export function urlencoded(data: FormData): EncodedData {
  const pieces = [];
  for (let k in data) {
    pieces.push(
      fullURIEncode(k) + '=' + fullURIEncode(data[k])
    );
  }
  return {
    type: 'application/x-www-form-urlencoded',
    body: pieces.join('&'),
  };
};

export function multipart(data: FormData): EncodedData {
  let boundary = '';
  let invalid = true;
  while (invalid) {
    boundary = String(Math.floor(Math.random() * 999999999999));
    invalid = false;
    for (let k in data) {
      let v = data[k];
      if (typeof v === 'string' && v.indexOf(boundary) > -1) {
        invalid = true;
      }
    }
  }

  const pieces = [];
  for (let k in data) {
    pieces.push(
      'Content-Disposition: form-data; name="' + k.replace(QUOTE, '\\"') + '"\r\n\r\n' +
      data[k] + '\r\n'
    );
  }

  const encoded = (
    '--' + boundary + '\r\n' +
    pieces.join('--' + boundary + '\r\n') +
    '--' + boundary + '--'
  );

  return {
    type: 'multipart/form-data; boundary=' + boundary,
    body: encoded,
  };
}

export function json(data: FormData): EncodedData {
  return {
    type: 'application/json',
    body: JSON.stringify(data),
  };
}

export function plain(data: FormData): EncodedData {
  const pieces = [];
  for (let k in data) {
    pieces.push(k + '=' + data[k]);
  }
  return {
    type: 'text/plain',
    body: pieces.join('\r\n'),
  };
}
