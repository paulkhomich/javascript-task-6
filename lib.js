'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('!Filter');
    }
    // friends = массив приглашенных друзей, friendsCount - индекс для обхода
    this.friends = getFriends(friends, filter, Infinity); // Т.к. Инфинити > 0 всегда при любых +-
    this.friendsCount = 0;
}
Iterator.prototype.done = function () { // Добавляю метод done в конструктор
    if (this.friendsCount >= this.friends.length) { // Если индекс превысил кол-во людей
        return true;
    }

    return false;
};
Iterator.prototype.next = function () { // Добавляю метод next в конструктор
    if (!this.done()) {
        let i = this.friendsCount;
        this.friendsCount += 1;

        return this.friends[i];
    }

    return null;
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('!Filter');
    }
    this.friends = getFriends(friends, filter, maxLevel);
    this.friendsCount = 0;
}
LimitedIterator.prototype = Object.create(Iterator.prototype); // Объявляю прототип
// Почему-то не работал setPrototype, так и не разобрался :O

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filterFunc = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filterFunc = function (friend) {
        return friend.gender === 'male';
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filterFunc = function (friend) {
        return friend.gender === 'female';
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

function getFriends(friends, filter, maxLevel) {
    let inviteFriends = []; // Массив всех найденных друзей, еще без фильтрации, потенциальные
    let circle = friends.filter((friend) => { // Создаю первый круг - лучшие друзья
        return friend.best;
    });
    // Пока кол-во кругов позволяет и круг родитель не пустой начинаю 
    while (maxLevel > 0 && circle.length > 0) {
        circle.sort((f1, f2) => { // Сортирую по алфавиту
            return f1.name > f2.name;
        });
        inviteFriends = inviteFriends.concat(circle); // Плюсую найденный круг
        circle = createCircleNew(circle, friends, inviteFriends); // Создаю новый
        maxLevel -= 1;
    }
    // Теперь фильтрую по заданому фильтру
    inviteFriends = inviteFriends.filter((f)=>filter.filterFunc(f));

    return inviteFriends;
}
// Функция поиска человека-объекта по имени
function findByName(friends, name) {
    let finder = null;
    friends.forEach((friend) => {
        if (friend.name === name) {
            finder = friend;
        }
    });

    return finder;
}
// Проверка, нет ли человека уже в списке потенциально-приглашенных
function alreadyAddFriend(inviteFriends, name) {
    let finder = false;
    inviteFriends.forEach((inviteFriend) => {
        if (inviteFriend.name === name) {
            finder = true;
        }
    });

    return finder;
}
// Создание нового круга основываясь на предыдущих функциях
function createCircleNew(circle, friends, inviteFriends) {
    let circleNew = [];
    circle.forEach((person) => {
        person.friends.forEach((name) => {
            if (!alreadyAddFriend(inviteFriends, name)) {
                let friend = findByName(friends, name);
                circleNew.push(friend);
            }
        });
    });

    return circleNew;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
