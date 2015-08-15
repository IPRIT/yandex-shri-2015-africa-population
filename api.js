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