const startButton = document.querySelector('#start');
const status = document.querySelector('#status');
const result = document.querySelector('#result');

startButton.addEventListener('click', () => {
    const worker = new Worker('./thread.js');
    startButton.disabled = true;
    status.textContent = 'Расчёт в thread2.js…';
    worker.addEventListener('message', event => {
        if (event.data.error) status.textContent = event.data.error;
        else {
            result.textContent = event.data.result;
            status.textContent = 'Результат получен через thread.js';
        }
        startButton.disabled = false;
        worker.terminate();
    });
    worker.addEventListener('error', event => {
        status.textContent = event.message;
        startButton.disabled = false;
        worker.terminate();
    });
    worker.postMessage({ timeout: 3000 });
});
