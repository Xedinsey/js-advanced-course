const startButton = document.querySelector('#start');
const unregisterButton = document.querySelector('#unregister');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const generatedAt = document.querySelector('#generated-at');
let registration;
let registered = false;

function send(type) {
    registration.active.postMessage({
        version: 1,
        requestId: crypto.randomUUID(),
        type,
        functionName: 'slowFunction',
        params: { timeout: 3000 }
    });
}

async function register() {
    if (!('serviceWorker' in navigator)) {
        status.textContent = 'Service Worker не поддерживается браузером';
        return;
    }
    navigator.serviceWorker.addEventListener('message', event => {
        const message = event.data;
        if (message?.version !== 1) return;
        if (message.type === 'error') {
            status.textContent = message.error;
        } else if (message.type === 'result' && message.functionName === 'slowFunction') {
            result.textContent = message.result;
            generatedAt.textContent = `Время расчёта: ${message.generatedAt}`;
            status.textContent = message.fromCache ? 'Результат из кеша' : 'Результат обновлён во всех вкладках';
        }
        startButton.disabled = !registered;
    });
    try {
        registration = await navigator.serviceWorker.register('./service-worker.js');
        await navigator.serviceWorker.ready;
        registered = true;
        unregisterButton.disabled = false;
        status.textContent = 'Получение результата из кеша…';
        send('get-result');
    } catch (error) {
        status.textContent = error.message;
    }
}

startButton.addEventListener('click', () => {
    startButton.disabled = true;
    status.textContent = 'Перегенерация результата…';
    send('regenerate');
});

unregisterButton.addEventListener('click', async () => {
    try {
        await registration.unregister();
        registered = false;
        startButton.disabled = true;
        unregisterButton.disabled = true;
        status.textContent = 'Регистрация Service Worker удалена';
    } catch (error) {
        status.textContent = error.message;
    }
});

register();
