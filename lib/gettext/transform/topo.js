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

    return util.checkExsit(path.resolve('.', target))
        .then(() => {
            try {
                var data = JSON.parse(fs.readFileSync(path.resolve('.', target)), {encoding: 'utf8'});
                // 输出
                var toWrite = gettextParser.po.compile(data).toString();

                if (opts.o) {
                    write(
                        path.resolve('.', target.replace('.json', '.po')),
                        toWrite
                    );
                }
                else {
                    console.log(toWrite);
                }
                return toWrite;
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
