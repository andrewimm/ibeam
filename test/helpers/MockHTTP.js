export default class MockHTTP {
  constructor(responses) {
    this._requests = [];
    this._responses = responses || [];
  }

  enqueueResponse(r) {
    this._responses.push(r);
  }

  lastRequest() {
    return this._requests[this._requests.length - 1];
  }

  request(method, url, payload, headers) {
    this._requests.push({
      method: method,
      url: url,
      payload: payload,
      headers: headers,
    });
    return Promise.resolve(this._responses.shift() || null);
  }
}
