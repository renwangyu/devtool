onconnect = (e) => {
  console.log('connect', e);
  const port = e.ports[0];

  port.addEventListener('message', (e) => {
    const str = JSON.stringify(e.data);
    const res = `res: ${str}`;
    port.postMessage(res)
  });

  port.start();
}
