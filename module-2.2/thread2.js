function slowFunction(timeout = 3000) {
    const start = performance.now();
    let result = 0;
    let iteration = 0;
    do {
        iteration += 1;
        result += (Math.random() - 0.5) * iteration;
    } while (performance.now() - start < timeout);
    return result;
}

self.addEventListener('message', event => {
    self.postMessage({ result: slowFunction(event.data.timeout) });
});
