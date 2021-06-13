"use strict";

const App = document.getElementById("root"); // Место рендера для списка юзеров из API
const input = document.getElementById("search"); // получил инпут для поиска по fullname
const searchBtn = document.getElementById("clear"); // кнопка для очистки строки поиска
const spinner = document.getElementById("spinner"); // спиннер добавил не через d.createElement - подумал так тоже можно
const _pathAPI = `https://randomuser.me/api/?results=15`; // записал путь для запроса на API

let term = ""; // сохранияю значение строки для правильного поиска

const getUsers = async () => {
    spinner.removeAttribute("hidden"); // показываем спиннер
    return await fetch(_pathAPI)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Could not fetch ${ url }, ${ res.status }`);
            }
            return res.json();
        }) // преобразуем в json
        .then((users) => {
            spinner.setAttribute("hidden", ""); // как только данные получены, скрываем спиннер
            return users.results; // возвращаем результат promise
        })
        .catch(e => console.log(e.message));
}; // асинхронная функция для получения данных из API

function debounce(callback, delay) {
    let timeout;
    return function () {
        const fnCall = () => {
            callback.apply(this, arguments);
        };
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, delay);
    };
} // Функция debounce (принимает другую функцию и задежку), нужна для уменьшения кол-вызова метода обновления списка(таблицы)

function notFound() {
    const NotFound = document.createElement("div");
    NotFound.innerText = "NOT FOUND";
    NotFound.classList.add("not_found");
    return NotFound;
} // Компенет NotFound, отображается если нет совпадений по поиску

async function renderUser() {
    // Основная функция для рендера списка элементов

    const usersAll = await getUsers(); // получаем массив users из API

    function updateSearch() {
        App.innerHTML = ``; //обновляем каждый раз при вызове функции HTML

        const usersMyFilter = usersAll.filter((item) => {
            const {
                name: { first, last },
            } = item; // Деструктуризация полей имен из item
            const fullName = `${ first } ${ last }`; // Собираем fullname
            return fullName.toLowerCase().includes(term.toLowerCase()); // Возвращаем результат метода filter(ищем совпадения из term в fullname)
        }); // Специально разбил на два массива, а не применяю на одном  (filter, forEach), что бы можно было объяснить и расписать подробнее

        if (usersMyFilter.length === 0) {
            App.appendChild(notFound());
        } // Проверяем, есть ли в уже отфильтрованном массиве элементы и если нет, то возвращаем компенент NotFound

        usersMyFilter.forEach((item) => {
            // Перебираем отфильтрованный массив
            const {
                email,
                name: { first, last },
                phone,
                picture: { thumbnail, large },
                location: { state, city },
                registered: { date },
            } = item; // деструктурируем значения из item
            const fullName = `${ first } ${ last }`; // Собираем fullname
            const normalDate = date.slice(0, 10).split("-").reverse().join("."); // Делаем дату как в задании
            const tableRow = document.createElement("tr"); // создаем строку таблицы
            tableRow.innerHTML =
                // Помещаем в строку HTML
                `
                        <td>${ fullName }</td>
                        <td>
                            <div class="tooltip__image">
                                <img id="photo" src=${ thumbnail } class="photo" alt=${ fullName }/>
                                <img id="" src=${ large } class="tooltip" alt=${ fullName }/>
                            </div>
                        </td>
                        <td>${ state } ${ city }</td>
                        <td>${ email }</td>
                        <td>${ phone }</td>
                        <td>${ normalDate }</td>
                    
            `;
            App.appendChild(tableRow); // Помещаем строку в тег <tbody id="root"></tbody>
        });
    }

    updateSearch(); // Инициализируем в первый раз render
    searchPanel(updateSearch); // Вызываем метод поиска
    clearSearch(updateSearch); // Вызываем метод очистки
}

renderUser(); // Вызываем основную функцию

function searchPanel(fn) {
    // Создал функцию для поиска элементов
    function research(e) {
        // создал функцию для получения e в debounce
        term = e.target.value; // присвоил значение из e.target.value в term
        fn(); // Вызываем переданную фунцию
    }

    research = debounce(research, 500); // перезаписал функцию с debounce и выставил delay 500
    input.addEventListener("input", research); // Добавил обработчик событый для input, вызываю research, каждый раз при изменении input.value
}

function clearSearch(fn) {
    // Создал функцию для очистки поиска и возвращения к полному списку Users
    searchBtn.addEventListener("click", () => {
        // Повесил обработчик событий на кнопку
        term = ""; // сбросил значение term
        input.value = ""; // сбросил значение из input
        fn(); //вызвал переданную функцию(обновляет render)
    });
}
