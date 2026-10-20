# Контракт сообщений

Запрос: `{ version: 1, requestId: string, type: 'get-result' | 'regenerate', functionName: 'slowFunction', params: { timeout: number } }`.

`get-result` возвращает кеш или запускает вычисление, если кеш пуст. `regenerate` всегда пересчитывает результат и заменяет кеш.

Ответ: `{ version: 1, requestId, type: 'result', functionName, params, result: number, generatedAt: string, fromCache: boolean }`.

Ошибка: `{ version: 1, requestId, type: 'error', error: string }`.

Ключ кеша включает имя функции и параметры. Новые функции добавляются в таблицу `functions`. Свежий результат отправляется всем вкладкам в области регистрации, кешированный — запрашивающей вкладке.

Запуск: `python3 -m http.server 8765`, затем открыть `http://localhost:8765/module-2.3/`.
