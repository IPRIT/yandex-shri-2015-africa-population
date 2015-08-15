/**
 * Реализация API, не изменяйте ее
 * @param {string} url
 * @param {function} callback
 */
function getData(url, callback) {
    var RESPONSES = {
        '/countries': [
            {name: 'Cameroon', continent: 'Africa'},
            {name: 'Fiji Islands', continent: 'Oceania'},
            {name: 'Guatemala', continent: 'North America'},
            {name: 'Japan', continent: 'Asia'},
            {name: 'Yugoslavia', continent: 'Europe'},
            {name: 'Tanzania', continent: 'Africa'}
        ],
        '/cities': [
            {name: 'Bamenda', country: 'Cameroon'},
            {name: 'Suva', country: 'Fiji Islands'},
            {name: 'Quetzaltenango', country: 'Guatemala'},
            {name: 'Osaka', country: 'Japan'},
            {name: 'Subotica', country: 'Yugoslavia'},
            {name: 'Zanzibar', country: 'Tanzania'}
        ],
        '/populations': [
            {count: 138000, name: 'Bamenda'},
            {count: 77366, name: 'Suva'},
            {count: 90801, name: 'Quetzaltenango'},
            {count: 2595674, name: 'Osaka'},
            {count: 100386, name: 'Subotica'},
            {count: 157634, name: 'Zanzibar'}
        ]
    };

    setTimeout(function() {
        var result = RESPONSES[url];
        if (!result) {
            return callback('Unknown url');
        }

        callback(null, result);
    }, Math.round(Math.random() * 1000));
}


/**
 *
 * # Описание проблемы:
 *
 * В предоставленном листинге переменная `request` в одной области видимости замыкается
 * тремя функциями `callback`, однако значение переменной `request` меняется на каждой
 * итерации, и, вследствие ассинхронности функции `getData`, обратный вызов функции
 * `callback` будет происходить с замкнутой переменной `request`, которая имеет значение
 * последнего элемента массива `requests` (в текущей версии `apiUrls` — прим.).
 * Код выполняется неуспешно, вследствие того, что количество ключей объекта `responses`
 * всегда меньше трех.
 *
 *
 * # Решение проблемы:
 *
 * Достаточно замкнуть каждую переменную `request` на соответствующую функцию `callback`
 * с помощью замыкающей анонимной функции.
 * ```js
 * var a = 1;
 * var callback = (function(a){ ... })(a);
 * ```
 *
 *
 * # Изменения в решении:
 *
 * В приведенном ниже решении итерирующие переменные имеют локальные значения для устранения
 * дальнейших пересечений и проблем.
 * Изменен алгоритм подсчета численности населения для Африки.
 *
 *
 * # Аннотация:
 *
 * Диалог с пользователем ведется с помощью `prompt`.
 * ```
 * /population [city|country|continent] — показывает численность населения для города, страны или континента.
 * /get cities|countries|continents — показывает список городов, стран или континентов соответственно.
 * /exit — завершает текущий диалог.
 * ```
 *
 * Для возобновления диалога необходимо отправить в консоль `startDialog()`.
 */


/**
 * Ваши изменения ниже
 */
var apiUrls = [
    '/countries',
    '/cities',
    '/populations'
];

/**
 * @description
 * Вычисляет размер популяции для Африки.
 */
function computeAfricanPopulation() {
    var responses = {};

    for (var i = 0; i < apiUrls.length; ++i) {
        var request = apiUrls[i];
        var callback = (function(url) {
            return function(error, result) {
                if (error) throw error;
                responses[url] = result;
                var keys = Object.keys(responses);

                if (keys.length === apiUrls.length) {
                    var curIndex = 0, stencil = ['Africa'],
                        indexUrl = apiUrls[curIndex], curResponse = responses[indexUrl],
                        internalKeys = ['continent', 'country', 'name'];

                    while (indexUrl) {
                        var newStencil = [], curInternalKey = internalKeys[curIndex];
                        for (var i = 0; i < stencil.length; ++i) {
                            for (var j = 0; j < curResponse.length; ++j) {
                                if (curResponse[j][curInternalKey] === stencil[i]) {
                                    newStencil.push(curResponse[j].count || curResponse[j].name);
                                }
                            }
                        }
                        stencil = newStencil;
                        indexUrl = apiUrls[++curIndex];
                        curResponse = responses[indexUrl];
                    }

                    var africanPopulation = stencil.reduce(function(prevValue, curValue) {
                        return prevValue + curValue;
                    });
                    console.log('Total population in African cities:', africanPopulation);
                }
            };
        })(request);

        getData(request, callback);
    }
}

computeAfricanPopulation();

setTimeout(startDialog, 1500);

/**
 * @description
 * Начинает диалог с пользователем.
 */
function startDialog() {
    var startMessage = 'Введите континент, страну или город:\n\nДоступные команды:\n' +
            '/population [city|country|continent] — показывает численность населения для города, страны или континента.\n\n' +
            '/get cities|countries|continents — показывает список городов, стран или континентов соответственно.\n\n' +
            '/exit — завершает текущий диалог.',
        output = console.log.bind(console, 'Численность населения равна:'),
        promptValue;

    promptValue = prompt(startMessage, '/');
    processInputData(promptValue, callback);

    function callback(resultCode, answer) {
        if (resultCode) {
            resultCode !== -2 && setTimeout(startDialog, 500);
            return;
        }
        output(answer);
        promptValue = prompt(startMessage, '/');
        processInputData(promptValue, callback);
    }
}


/**
 * @description
 * Обработчик входящих сообщений.
 *
 * @param {string} inputValue
 * @param {function} callback
 * @return void
 */
function processInputData(inputValue, callback) {
    inputValue = inputValue && inputValue.trim() || '/exit';

    var dividedData = inputValue.split(/\s/),
        command = dividedData.shift();

    var execCommands = {
        '/population': computePopulation,
        '/get': getPlaces,
        '/exit': closeDialog
    };

    if (!(command in execCommands)) {
        console.log('Такой команды не существует. Попробуйте снова.');
        return callback(-1);
    }

    execCommands[command]();

    function computePopulation() {
        if (!dividedData.length) {
            console.log('Пропущен второй параметр (city|country|continent).');
            return callback(-1);
        }
        getPopulation(dividedData.join(' '), callback);
    }

    function getPlaces() {
        if (!dividedData.length) {
            console.log('Пропущен второй параметр (cities|countries|continents).');
            return callback(-1);
        }
        printPlaces(dividedData.shift(), callback);
    }

    function closeDialog() {
        callback(-2);
    }
}


/**
 * @description
 * Ассинхронно возвращает численность популяции для определенного места.
 * Вызывает функции API.
 *
 * @param {string} query
 * @param {function} callback
 * @return void
 */
function getPopulation(query, callback) {
    if (typeof query !== 'string') {
        console.log('Второй параметр - пустой.');
        return callback(-1);
    }

    var responses = {};
    query = query.charAt(0).toUpperCase() + query.substr(1);

    for (var i = 0; i < apiUrls.length; ++i) {
        var curUrl = apiUrls[i];
        var requestCallback = (function(url) {
            return function(error, result) {
                if (error) {
                    console.log('Произошла неизвестная ошибка.');
                    return callback(-1);
                }
                responses[url] = result;
                var keys = Object.keys(responses);

                if (keys.length === apiUrls.length) {
                    var tree = buildTree(responses),
                        answer = tree.get(query);
                    if (!answer) {
                        console.log('Данные об этом месте отсутствуют.');
                        return callback(-1);
                    }
                    return callback(0, answer);
                }
            };
        })(curUrl);

        getData(curUrl, requestCallback);
    }
}


/**
 * @description
 * Строит особую структуру данных для дальнейшего удобного подсчета популяции.
 *
 * @param {object} responses — результаты API.
 * @return {object} — объект с функцией для подсчета популяции.
 */
function buildTree(responses) {
    var internalProperties = [
        ['name', 'continent'],
        ['name', 'country'],
        ['count', 'name']
    ], linkTree = {};

    for (var i = 0; i < apiUrls.length; ++i) {
        var curUrl = apiUrls[i],
            curResponse = responses[curUrl],
            curResponseRow;

        for (var j = 0; j < curResponse.length; ++j) {
            curResponseRow = curResponse[j];
            var curMainProperty = curResponseRow[ internalProperties[i][1] ],
                curSecondProperty = curResponseRow[ internalProperties[i][0] ];
            if (!Array.isArray(linkTree[curMainProperty]) && typeof curSecondProperty !== 'number') {
                linkTree[curMainProperty] = [];
            }
            if (typeof curSecondProperty !== 'number') {
                linkTree[curMainProperty].push(curSecondProperty);
            } else {
                linkTree[curMainProperty] = curSecondProperty;
            }
        }
    }

    return {
        get: getPopulationByLocation
    };

    function getPopulationByLocation(location) {
        if (typeof linkTree[location] === 'number') {
            return linkTree[location];
        }
        if (!linkTree[location]) {
            return 0;
        }
        var populationSum = 0;
        for (var i = 0; i < linkTree[location].length; ++i) {
            populationSum += getPopulationByLocation(linkTree[location][i]);
        }

        return populationSum;
    }
}


/**
 * @description
 * Получает с помощью API список всех континентов, стран или городов
 * и печатает их в консоль.
 *
 * @param {string} query
 * @param {function} callback
 * @return void
 */
function printPlaces(query, callback) {
    if (typeof query !== 'string') {
        console.log('Второй параметр - пустой.');
        return callback(-1);
    }

    var availableQueries = {
            'continents': ['/countries', 'continent'],
            'countries': ['/countries', 'name'],
            'cities': ['/cities', 'name']
        },
        curQuery = availableQueries[query];

    if (!curQuery) {
        console.log('Неверный запрос.');
        return callback(-1);
    }

    var requestCallback = function(error, result) {
        if (error || !Array.isArray(result)) {
            console.log('Произошла неизвестная ошибка.');
            return callback(-1);
        }

        console.log('\n' + query + ':');
        //note: нужно выводить только уникальные значения.
        var placesSet = {}, curPlace;
        for (var i = 0; i < result.length; ++i) {
            curPlace = result[i][ curQuery[1] ];
            if (curPlace in placesSet) {
                continue;
            }
            console.log(placesSet[curPlace] = curPlace);
        }
        callback(-1);
    };

    getData(curQuery[0], requestCallback);
}