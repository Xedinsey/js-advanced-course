const cacheName = 'js-course-results-v1';
let queue = Promise.resolve();

function slowFunction({ timeout = 3000 }) {
    if (!Number.isFinite(timeout) || timeout < 0 || timeout > 10000) {
        throw new Error('timeout должен быть числом от 0 до 10000');
    }
    const start = performance.now();
    let result = 0;
    let iteration = 0;
    do {
        iteration += 1;
        result += (Math.random() - 0.5) * iteration;
    } while (performance.now() - start < timeout);
    return result;
}

const functions = { slowFunction };

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

async function handleMessage(event) {
    const message = event.data;
    try {
        if (message?.version !== 1 || !['get-result', 'regenerate'].includes(message.type)) {
            throw new Error('Неизвестный тип сообщения или версия контракта');
        }
        if (!Object.hasOwn(functions, message.functionName)) {
            throw new Error('Неизвестная функция');
        }
        const params = message.params ?? {};
        const key = new URL(`results/${encodeURIComponent(JSON.stringify([message.functionName, params]))}`, self.registration.scope);
        const cache = await caches.open(cacheName);
        if (message.type === 'get-result') {
            const cached = await cache.match(key);
            if (cached) {
                event.source.postMessage({ ...await cached.json(), requestId: message.requestId, fromCache: true });
                return;
            }
        }
        const response = {
            version: 1,
            type: 'result',
            requestId: message.requestId,
            functionName: message.functionName,
            params,
            result: functions[message.functionName](params),
            generatedAt: new Date().toISOString(),
            fromCache: false
        };
        await cache.put(key, new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } }));
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clients.filter(client => client.url.startsWith(self.registration.scope))
            .forEach(client => client.postMessage(response));
    } catch (error) {
        event.source?.postMessage({ version: 1, type: 'error', requestId: message?.requestId, error: error.message });
    }
}

self.addEventListener('message', event => {
    queue = queue.then(() => handleMessage(event));
    event.waitUntil(queue);
});
