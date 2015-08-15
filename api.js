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
        var curUrl = apiUrls[i];
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
        })(curUrl);

        getData(curUrl, callback);
    }
}

computeAfricanPopulation();

setTimeout(startDialog, 1500);

/**
 * @description
 * Начинает диалог с пользователем.
 */
function startDialog() {
    var startMessage = 'Введите страну или город:\n\nДоступные команды:\n' +
            '/population [city|country|continent] — показывает численность населения для города, страны или континента\n' +
            '/exit — завершает текущий диалог',
        output = console.log.bind(console, 'Численность населения для города/страны/континента равна:'),
        promptValue;

    promptValue = prompt(startMessage, '/population Africa');
    processInputData(promptValue, callback);

    function callback(resultCode, answer) {
        if (resultCode) {
            resultCode !== -2 && setTimeout(startDialog, 500);
            return;
        }
        output(answer);
        promptValue = prompt(startMessage);
        processInputData(promptValue, callback);
    }
}


function processInputData(inputValue, callback) {
    inputValue = inputValue && inputValue.trim() || '/exit';

    var dividedData = inputValue.split(/\s/, 2),
        command = dividedData.shift();

    var execCommands = {
        '/exit': closeDialog,
        '/population': computePopulation
    };

    if (!(command in execCommands)) {
        console.log('Такой команды не существует. Попробуйте снова.');
        return callback(-1);
    }

    execCommands[command]();

    function closeDialog() {
        callback(-2);
    }

    function computePopulation() {
        if (!dividedData.length) {
            console.log('Пропущен второй параметр (city|country|continent).');
            return callback(-1);
        }
        getPopulation(dividedData.shift(), callback);
    }
}

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
                        treeKeys = Object.keys(tree),
                        curSubTree;
                    for (var i = 0; i < treeKeys.length; ++i) {
                        curSubTree = tree[treeKeys[i]];
                        if (typeof curSubTree[query] !== 'undefined') {
                            return callback(0, curSubTree[query]);
                        }
                    }

                    console.log('Ничего не найдено.');
                    callback(-1);
                }
            };
        })(curUrl);

        getData(curUrl, requestCallback);
    }
}

function buildTree(responses) {
    var tree = {
        continents: {},
        countries: {},
        cities: {}
    }, internalProperties = [
        ['name', 'continent'],
        ['name', 'country'],
        ['count', 'name']
    ];

    function buildSubTree(curSubTree, path) {
        var pathResponse = responses[path],
            propertyOffsetIndex = apiUrls.indexOf(path),
            startInternalProperties = Object.keys(pathResponse[0])[propertyOffsetIndex];
        for (var i = 0; i < pathResponse.length; ++i) {
            var curRow = pathResponse[i],
                curProperty = curRow[startInternalProperties]
        }
    }
}