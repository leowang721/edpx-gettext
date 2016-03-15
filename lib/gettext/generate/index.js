/**
 * @file edp gettext generate 命令处理主入口
 * @author Leo Wang(wangkemiao@baidu.com)
 */
'use strict';

var fs = require('fs');
var path = require('path');
var edp = require('edp-core');
var mkdirp = require('mkdirp');
var util = require('../../util');
var spawn = require('../../util/spawn');
var config = require('../config');

// 当前使用 jsxgettext 处理，所以要先适配一下，以后会去掉
var jsxgettext = require('jsxgettext');
var jsxgettextParsers = require('jsxgettext/lib/parsers');
var etplParse = require('./parser/etpl');
jsxgettextParsers.etpl = etplParse.etpl;

/* global exports */
exports.process = function (args, opts) {

    // 目标路径
    opts.target = args[0];
    if (!opts.target) {
        // 如果未指定目标路径，则默认找当前 edp project 的 src
        /*
         * edp项目信息
         * @type {Object}
         * {
         *     dir: '/Users/leowang/work/svn/fc-fe/workspace/nirvana-workspace/nirvana',
         *     infoDir: '/Users/leowang/work/svn/fc-fe/workspace/nirvana-workspace/nirvana/.edpproj'
         * }
         */
        var projectInfo = require('edp-project').getInfo();
        if (!projectInfo) {
            edp.log.warn('当前目录不是一个 edp project，使用当前路径。');
            opts.target = path.resolve('.');
        }
        else {
            opts.target = projectInfo.dir;
        }
    }

    opts.keyword = [opts.keyword || config.DEFAULT.keyword];
    opts.info = opts.info;
    if (!opts.info) {
        // 先尝试从 edp 项目信息中获取
        try {
            var data = JSON.parse(fs.readFileSync(path.resolve(opts.target, 'package.json')));
            opts.info = data.name + ' - ' + data.version;
        }
        catch (e) {
            opts.info = 'Project - Version';
        }
    }

    opts.joinExisting = true;
    opts.outputDir = path.resolve(opts.target, './output/po');
    opts.output = opts.info + '.zh-CN.po';

    // 确定了
    // 先直接使用 jsxgettext
    util.checkExsit(path.resolve('.', opts.target))
        .then(() => {
            var data = {
                js: [],
                es6: [],
                tpl: [],
                html: []
            };
            util.recursivelyReadFiles(opts.target, {
                callback: (fileData, eachPath) => {
                    var type = path.extname(eachPath).substring(1);
                    if (!data[type]) {
                        data[type] = [];
                    }
                    data[type].push(fileData);
                },
                filter: (path) => {
                    return /.(js|es6|tpl|html)$/.test(path);
                }
            });

            return data;
        })
        .then((data) => {
            // console.log(opts)
            // console.log(jsxgettextParsers.etpl(data, opts));
            // return jsxgettext.generate.apply(jsxgettext, jsxgettextParsers.ejs(data, opts));

            var result;
            for (var type in data) {
                if (!data.hasOwnProperty(type)) {
                    continue;
                }
                switch (type) {
                    case 'js':
                    case 'es6':
                        if (type === 'es6') {
                            console.log(util.getAst(data[type][0]));
                        }
                        result = jsxgettext.generate(data[type], opts);
                        break;
                    case 'tpl':
                    case 'html':
                        result = jsxgettext.generate.apply(jsxgettext, jsxgettextParsers.etpl(data[type], opts));
                        break;
                }
            }
            return result;
        })
        .then(parsedResult => {  // 修正数据
            var lines = parsedResult.split('\n');
            var newLines = [].concat(lines.slice(0, 2)).concat([
                '"Project-Id-Version: ' + opts.info + '\\n"',
                '"Language-Team: LANGUAGE <infe@baidu.com>\\n"',
                '"Report-Msgid-Bugs-To: Leo Wang(wangkemiao@baidu.com)\\n"',
                '"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"',
                '"Language: zh-cn\\n"'
            ]).concat(lines.slice(7));
            return newLines.join('\n');
        })
        .then(finalResult => {  // 输出
            if (opts.o !== true) {
                console.log(finalResult);
            }
            else {
                write(path.join(opts.outputDir || '', opts.output), finalResult);
            }
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
