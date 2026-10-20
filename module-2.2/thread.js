self.addEventListener('message', event => {
    const worker = new Worker('./thread2.js');
    worker.addEventListener('message', message => {
        self.postMessage(message.data);
        worker.terminate();
    });
    worker.addEventListener('error', error => {
        self.postMessage({ error: error.message });
        worker.terminate();
    });
    worker.postMessage(event.data);
});
