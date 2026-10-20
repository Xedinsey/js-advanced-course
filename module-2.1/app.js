const onceButton = document.querySelector('#once');
const reuseButton = document.querySelector('#reuse');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
let reusableWorker;
let reusableWorkerStarts = 0;

function createWorker(button, closeAfter) {
    const worker = new Worker('./thread.js');
    worker.addEventListener('message', event => {
        result.textContent = event.data;
        status.textContent = closeAfter
            ? 'Вычисление завершено, воркер остановлен'
            : `Вычисление завершено. Воркер создан ${reusableWorkerStarts} раз`;
        button.disabled = false;
        if (closeAfter) worker.terminate();
    });
    worker.addEventListener('error', event => {
        status.textContent = event.message;
        button.disabled = false;
        worker.terminate();
        if (worker === reusableWorker) reusableWorker = undefined;
    });
    return worker;
}

onceButton.addEventListener('click', () => {
    onceButton.disabled = true;
    status.textContent = 'Вычисление в новом воркере…';
    createWorker(onceButton, true).postMessage({ timeout: 3000 });
});

reuseButton.addEventListener('click', () => {
    if (!reusableWorker) {
        reusableWorker = createWorker(reuseButton, false);
        reusableWorkerStarts += 1;
    }
    reuseButton.disabled = true;
    status.textContent = 'Вычисление в переиспользуемом воркере…';
    reusableWorker.postMessage({ timeout: 3000 });
});

window.addEventListener('pagehide', () => {
    reusableWorker?.terminate();
    reusableWorker = undefined;
});
