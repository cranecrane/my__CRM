# Система управления контактными данными клиентов

> **REST API для базы данных клиентов**
>Для работы с приложением необходимо запустить его серверную часть. Перед запуском убедитесь, что вы установили Node.js версии 12 или выше.
>Для запуска сервера перейдите в папку "crm-backend" и выполните команду `node index`. Для остановки нажмите сочетание клавиш CTRL+C.

## Описание проекта
В разработанной программе реализован следующий функционал:
- просмотр списка клиентов в виде таблицы;
- добавление нового клиента;
- изменение информации о существующем клиенте (ФИО и контактная информация);
- сортировка списка клиентов;
- поиск по списку клиентов.

Интерфейс представляет из себя единственную страницу, на которой располагается таблица клиентов, кнопка для добавления нового клиента, а также шапка с логотипом компании и строкой поиска клиентов. 

### Добавление нового клиента и редактирование данных
Форма для создания и редактирования информации о клиенте может включает в себя набор следующих данных: фамилия и имя (обязательно), отчество и до 10 контактов. Контакты могут быть пяти типов: номер телефона, адрес электронной почты, ссылка на профиль VKontakte, ссылка на профиль Facebook и обобщенный тип контакта "Другое".
![image](https://github.com/cranecrane/my__CRM/raw/master/src/img/addClient.gif)

### Удаление клиента
Удаление строки с данными можно произвести двумя способами: через форму изменения данных клиента или через кнопку "Удалить" в последней колонке таблицы.
![image](https://github.com/cranecrane/my__CRM/raw/master/src/img/delete.gif)

### Сортировка списка клиентов
Все заголовки колонок, кроме контактов и действий, можно нажать, чтобы установить сортировку по соответствующему полю. Первое нажатие устанавливает сортировку по возрастанию, повторное - по убыванию. По умолчанию установлена сортировка по возрастанию по ID.
![image](https://github.com/cranecrane/my__CRM/raw/master/src/img/sorting.gif)

### Поиск по списку клиентов
В проекте реализован поиск с автодополнением - список найденных элементов отображается непосредственно под полем для ввода, без изменения самой таблицы. При выборе элемента в списке подсвечивается соответствующая строка в таблице и, при необходимости, страница прокручивается до выделенного контакта.

![image](https://github.com/cranecrane/my__CRM/raw/master/src/img/search.gif)
