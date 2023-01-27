// импорт стандартных библиотек Node.js
const { readFileSync } = require("fs");
const { createServer } = require("http");
const path = require("path");

// файл для базы данных
const DB_FILE = process.env.DB_FILE || path.resolve(__dirname, "db.json");
// номер порта, на котором будет запущен сервер
const PORT = process.env.PORT || 3024;
// префикс URI для всех методов приложения
const URI_PREFIX = "/api/product";


class ApiError extends Error {
  constructor(statusCode, data) {
    super();
    this.statusCode = statusCode;
    this.data = data;
  }
}

function getGoodsList(params = {}) {
  const goods = JSON.parse(readFileSync(DB_FILE) || "[]");

  let data = goods;

  if (params.category) {
    const category = params.category.trim().toLowerCase();
    const regExp = new RegExp(`^${category}$`);
    data = data.filter((item) => regExp.test(item.category.toLowerCase()));
  }

  if (params.list) {
    const list = params.list.split(',');
    data = data.filter((item) => list.includes(item.id));
  }

  return data;
}


function getItems(itemId) {
  const goods = JSON.parse(readFileSync(DB_FILE) || "[]");
  const item = goods.find(({ id }) => id === itemId);
  if (!item) throw new ApiError(404, { message: "Item Not Found" });
  return item;
}


// создаём HTTP сервер, переданная функция будет реагировать на все запросы к нему
module.exports = server = createServer(async (req, res) => {
  // req - объект с информацией о запросе, res - объект для управления отправляемым ответом
  // чтобы не отклонять uri с img
  if (req.url.substring(1, 4) === "img") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/jpeg");
    require("fs").readFile(`.${req.url}`, (err, image) => {
      res.end(image);
    });
    return;
  }

  // этот заголовок ответа указывает, что тело ответа будет в JSON формате
  res.setHeader("Content-Type", "application/json");

  // CORS заголовки ответа для поддержки кросс-доменных запросов из браузера
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // запрос с методом OPTIONS может отправлять браузер автоматически для проверки CORS заголовков
  // в этом случае достаточно ответить с пустым телом и этими заголовками
  if (req.method === "OPTIONS") {
    // end = закончить формировать ответ и отправить его клиенту
    res.end();
    return;
  }

  // если URI не начинается с нужного префикса - можем сразу отдать 404
  if (!req.url || !req.url.startsWith(URI_PREFIX)) {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Not Found" }));
    return;
  }

  // убираем из запроса префикс URI, разбиваем его на путь и параметры
  const [uri, query] = req.url.substr(URI_PREFIX.length).split("?");
  const queryParams = {};
  // параметры могут отсутствовать вообще или иметь вид a=b&b=c
  // во втором случае наполняем объект queryParams { a: 'b', b: 'c' }
  if (query) {
    for (const piece of query.split("&")) {
      const [key, value] = piece.split("=");
      queryParams[key] = value ? decodeURIComponent(value) : "";
    }
  }

  try {
    // обрабатываем запрос и формируем тело ответа
    const body = await (async () => {
      if (uri === "" || uri === "/") {
        // /api/goods
        if (req.method === "GET") return getGoodsList(queryParams);
      } else {
        // /api/goods/{id}
        // параметр {id} из URI запроса
        const itemId = uri.substr(1);
        if (req.method === "GET") return getItems(itemId);
      }
      return null;
    })();
    res.end(JSON.stringify(body));
  } catch (err) {
    console.log("err: ", err);
    // обрабатываем сгенерированную нами же ошибку
    if (err instanceof ApiError) {
      res.writeHead(err.statusCode);
      res.end(JSON.stringify(err.data));
    } else {
      // если что-то пошло не так - пишем об этом в консоль и возвращаем 500 ошибку сервера
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Server Error" }));
    }
  }
})
  // выводим инструкцию, как только сервер запустился...
  .on("listening", () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(
        `Сервер CRM запущен. Вы можете использовать его по адресу http://localhost:${PORT}`
      );
      console.log("Нажмите CTRL+C, чтобы остановить сервер");
      console.log("Доступные методы:");
      console.log(`GET ${URI_PREFIX} - получить список товаров`);
      console.log(`GET ${URI_PREFIX}/{id} - получить товар по его ID`);
      console.log(`GET ${URI_PREFIX}?{list="id,id,id"} - получить список с id);`);

    }
  })
  // ...и вызываем запуск сервера на указанном порту
  .listen(PORT);
