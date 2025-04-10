# Проект по физике

Сайт-симулятор движения заряженных частиц под действием постоянного магнитного или электрического поля

Сайт доступен по ссылке: https://petrovviacheslav.github.io/physics-project/#/electro

## TODO

1. Обработка 3 передаваемых частиц
2. Выбрать оптимальные значения 1e для обоих полей (наиболее реальные)
3. Что происходит с точкой в магнитном поле, у которой вектор скорости и магнитной индукции сонаправлены? -> движется только благодаря скорости, надо тогда убирать каждый раз подсчёт силы лоренца (флаг?)
4. Что происходит с магнитным полем, если скорость = 0? -> в магнитном частица будет тупо стоять на месте (проверка на это?)
5. Возможно написать бэк для ускорения

## Запуск проекта

1. Клонируйте репозиторий:
    ```shell
    git clone https://github.com/petrovviacheslav/physics-project.git
    cd physics-project
    ```
2. Установите все нужные зависимости:
    ```shell
   npm install
   ```
3. Запустите приложение:
   ```shell
   npm start
   ```
4. Сайт будет доступен по адресу: `http://localhost:3000/physics-project/#/electro`

## Лицензия <a name="license"></a>

Проект доступен с открытым исходным кодом на условиях [Apache-2.0 license](./LICENSE).<br>
*Авторские права 2025 Вячеслав Петров и Пронкин Алексей*<br>

<a href="https://github.com/petrovviacheslav/physics-project/graphs/contributors">
  <img alt="contributors" src="https://contrib.rocks/image?repo=petrovviacheslav/physics-project" />
</a><br>
