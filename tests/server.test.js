const http = require('http');
const assert = require('assert');
const server = require('../server');

function request(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ port, path }, (res) => {
      res.resume();
      res.on('end', () => resolve(res));
    });
    req.on('error', reject);
  });
}

(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res1 = await request(port, '/index.html?foo=bar');
    assert.strictEqual(res1.statusCode, 200, 'index.html should return 200');

    const res2 = await request(port, '/does-not-exist.txt');
    assert.strictEqual(res2.statusCode, 404, 'nonexistent file should return 404');

    console.log('All tests passed');
  } catch (err) {
    console.error('Test failed');
    console.error(err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
})();
