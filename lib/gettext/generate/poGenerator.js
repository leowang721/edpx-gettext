/**
 * @file 生成.po文件的内容
 * @author Leo Wang(wangkemiao@baidu.com)
 */

var fs = require('fs');
var path = require('path');
var gettextParser = require('gettext-parser');

/* global exports */
exports.generate = function (translations, opts) {
    opts = opts || {};

    var poData = getPOData(opts);

    if (Object.keys(translations).length === 0) {
        return poData;
    }

    var current = poData.translations[''];
    for (var k in translations) {
        if (!translations.hasOwnProperty(k)) {
            continue;
        }
        if (current[k]) {
            // extend
            var currentArr = current[k].comments.reference.split('\n');
            var newArr = currentArr.concat(translations[k].comments.reference.split('\n'));
            var m = {};
            for (var i = newArr.length - 1; i >= 0; i--) {
                if (m[newArr[i]]) {
                    newArr.splice(i, 1);
                }
                else {
                    m[newArr[i]] = true;
                }
            }

            current[k].comments.reference = newArr.join('\n');
        }
        else {
            current[k] = translations[k];
        }
    }
    return poData;
};

function getPOData(opts) {
    if (opts.currentPoData) {
        return opts.currentPoData;
    }

    try {
        var data = fs.readFileSync(path.resolve(opts.outputDir, opts.output), {encoding: 'utf8'});
        opts.currentPoData = gettextParser.po.parse(data, 'utf-8');
    }
    catch (e) {
        opts.currentPoData = {
            charset: 'utf-8',
            headers: {
                'project-id-version': opts.info || 'PACKAGE VERSION',
                'language-team': 'LANGUAGE <infe@baidu.com>',
                'report-msgid-bugs-to': 'Leo Wang(wangkemiao@baidu.com)',
                'po-revision-date': 'YEAR-MO-DA HO:MI+ZONE',
                'language': opts.lang,
                'mime-version': '1.0',
                'content-type': 'text/plain; charset=utf-8',
                'content-transfer-encoding': '8bit',
                'pot-creation-date': new Date().toISOString().replace('T', ' ').replace(/:\d{2}.\d{3}Z/, '+0000')
            },
            translations: {}
        };
        opts.currentPoData.translations[''] = {};  // default context
    }
    return opts.currentPoData;
}
