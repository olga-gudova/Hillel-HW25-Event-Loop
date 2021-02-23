// 1 - выведет в указанной последовательности как синхронный код
console.info("foo");
console.info("bar");
console.info("baz");

// 2 - сперва синхронный код foo, baz, далее асинхронный bar не ранее чем через 1 секунду
console.info("foo");
setTimeout(() => console.info("bar"), 1000);
console.info("baz");

// 3 - сперва синхронный код foo, baz, далее асинхронный bar
console.info("foo");
setTimeout(() => console.info("bar"), 0);
console.info("baz");

// 4 - сперва синхронный код baz. В task queue попадает сначала коллбэк из setInterval, затем из setTimeout с одинаковой задержкой. 
// Выполняются по принципу FIFO: сперва выводится foo, в очередь попадает задача очистки таймера, далее выводится bar, и срабатывает очистка таймера.
const timer = setInterval(() => {
  console.info("foo");
  setTimeout(() => clearTimeout(timer), 0);
}, 1000);
setTimeout(() => console.info("bar"), 1000);
console.info("baz");

// 5  - по традиции начинаем с синхронного кода, baz. В task queue попадает сначала коллбэк из setInterval, далее коллбэк из setTimeout на 34й строке.
// Задержка одинаковая, поэтому в коллстэк они попадают в порядке своей очередности. Выполнение коллбэка из setInterval состоит в вызове setTimeout,
// его коллбэк становится самым последним в task queue. Срабатывает bar, затем последнее в очереди - вложенный коллбэк foo и очистка таймера.
const timer = setInterval(() => {
  setTimeout(() => {
    console.info("foo");
    clearTimeout(timer);
  }, 0);
}, 1000);
setTimeout(() => console.info("bar"), 1000);
console.info("baz");

// 6 - сначала синхронный baz. В job queue попадает промис, выполняется первым как микротаска, помещая в job queue следующий промис then. Выводит foo.
// После того как job queue очищена, приходит время для task queue.
Promise.resolve("foo").then((res) => console.info(res));
setTimeout(() => console.info("bar"), 0);
console.info("baz");

// 7 - интепретатор читает код подряд, выполняя синхронный и помещая асинхронный в свои очереди. Первыми выведутся синхронные baz, затем baz2.
// Промисы попадают в job queue, выполняются первыми, моментально помещая туда же зачейненые промисы. Выполняются они: выводят bar, bar2.
// Таймеры помещают свои коллбэки в task queue. Как только job queue пуста, видим foo и foo2.
setTimeout(() => console.info("foo"), 0);
Promise.resolve("bar").then((res) => console.info(res));
console.info("baz");
setTimeout(() => console.info("foo2"), 0);
Promise.resolve("bar2").then((res) => console.info(res));
console.info("baz2");

// 8 - Коллбэк из setTimeout попадает в task queue с задержкой 1000. Цепочка промисов со следующей строки - в job queue. 
// Срабатывает и первым выводится синхронный baz. job queue следующая, там пополнение task queue с задержкой 1000.
// Прошла секунда, выполняется первая функция из setTimeout. Она помещет задачу в job queue, которая выполняется сейчас, 
// т.к. имеет приоритет перед task queue, и выводит foo. Далее последнаяя оставшаяся задача - bar
setTimeout(() => Promise.resolve("foo").then((res) => console.info(res)), 1000);
Promise.resolve("bar").then((res) => {
  setTimeout(() => console.info(res), 1000);
});
console.info("baz");

// 9 - Коллбэк из setTimeout попадает в task queue с задержкой 1000. Цепочка промисов со следующей строки - в job queue. 
// Срабатывает и первым выводится синхронный baz. job queue следующая, там пополнение task queue с задержкой уже 500.
// У нас заполнена только task queue, истекает время 500 мс, вывод bar. Истекает 1000 мс, пополнение и исполение job queue с foo.
setTimeout(() => Promise.resolve("foo").then((res) => console.info(res)), 1000);
Promise.resolve("bar").then((res) => {
  setTimeout(() => console.info(res), 500);
});
console.info("baz")

// 10 - выполняется синхронный код с baz. В job queue есть задача с foo, выполняется. Далее выполняется задача из task queue с bar.
(async () => {
    const result = await Promise.resolve("foo");
    console.info(result);
  }
)();
setTimeout(() => console.info("bar"), 0);
console.info("baz");

// 11 - функция, переданная в setTimeout, сразу вызвана, поэтому мы видим первым результат ее выполнения, foo.
// В job queue попадает промис, который сразу резолвится, попадает в коллстэк и выполнаяется с выводом baz
setTimeout(console.info("foo"), 0);
console.info("bar");

(async () => {
  const result = await Promise.resolve("baz");
  console.info(result);
})();