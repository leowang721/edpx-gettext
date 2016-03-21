/**
 * @file 转换一个po为json
 * @author Leo Wang(wangkemiao@baidu.com)
 */

var gettextParser = require('gettext-parser');
var fs = require('fs');
var path = require('path');
var edp = require('edp-core');
var util = require('../../util');
var mkdirp = require('mkdirp');

/* global exports */
exports.process = function (args, opts) {
    // 目标路径
    var target = args[0];
    if (!target) {
        throw new Error('必须指定目标文件。');
    }

    util.checkExsit(path.resolve('.', target))
        .then(() => {
            try {
                var data = gettextParser.po.parse(
                    fs.readFileSync(path.resolve('.', target)), {encoding: 'utf8'},
                    'utf-8'
                );

                // 数据处理一下
                var toWrite = {};
                for (var k in data.translations['']) {
                    if (!data.translations[''].hasOwnProperty(k)) {
                        continue;
                    }
                    toWrite[k] = data.translations[''][k].msgstr[0];
                }

                var outputStr = JSON.stringify(toWrite);

                // 准备输出
                if (opts.amd) {
                    outputStr = [
                        'define(function(require) {',
                        '    return ' + outputStr + ';',
                        '})'
                    ].join('\n');
                }

                if (opts.o) {
                    // 输出
                    write(
                        path.resolve('.', target.replace('.po', opts.amd ? '.js' : '.json')),
                        outputStr
                    );
                }
                else {
                    console.log(outputStr);
                }
            }
            catch (e) {

            }
        })
        .then(null, () => {
            edp.log.error('文件不存在或者格式转换失败！');
        });
};

function write(targetPath, data) {
    mkdirp.sync(edp.path.dirname(targetPath));
    fs.writeFileSync(
        path.resolve(targetPath),
        data,
        'utf8'
    );
}
