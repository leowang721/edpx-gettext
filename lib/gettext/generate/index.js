/**
 * @file edp gettext generate 命令处理主入口
 * @author Leo Wang(wangkemiao@baidu.com)
 */
'use strict';

var fs = require('fs');
var path = require('path');
var edp = require('edp-core');
var mkdirp = require('mkdirp');
var gettextParser = require('gettext-parser');
var util = require('../../util');
// var spawn = require('../../util/spawn');
var config = require('../config');

var poGenerator = require('./poGenerator');

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
    opts.outputDir = path.resolve(edp.path.dirname(opts.target), './output/po');
    opts.output = opts.info + '.zh-CN.po';

    util.checkExsit(path.resolve('.', opts.target))
        .then(() => {
            var data = {
                js: {},
                es6: {},
                tpl: {},
                html: {}
            };
            util.recursivelyReadFiles(opts.target, {
                callback: (fileData, eachPath) => {
                    var type = path.extname(eachPath).substring(1);
                    if (!data[type]) {
                        data[type] = [];
                    }
                    data[type][path.relative('.', eachPath)] = fileData;
                },
                filter: (path) => {
                    return /.(js|es6|tpl|html)$/.test(path);
                }
            });

            return data;
        })
        .then((data) => {
            var result;
            for (var type in data) {
                if (!data.hasOwnProperty(type)) {
                    continue;
                }

                if (Object.keys(data[type]).length === 0) {
                    continue;
                }

                switch (type) {
                    case 'js':
                        result = jsxgettext.parse(data[type], opts);
                        break;
                    case 'es6':
                        var translations = {};
                        for (var eachPath in data[type]) {
                            if (!data[type].hasOwnProperty(eachPath)) {
                                continue;
                            }
                            var ast = util.getAst(data[type][eachPath]);
                            util.traverse(ast, {
                                enter: function (node) {
                                    if (node.type === 'CallExpression'
                                        && node.callee.type === 'Identifier'
                                        && opts.keyword.indexOf(node.callee.name) > -1) {
                                        var line = node.loc.start.line;
                                        var toTranslate = node.arguments[0].value;

                                        if (translations[toTranslate]) {
                                            var arr = translations[toTranslate].comments.reference.split('\n');
                                            if (arr.indexOf(eachPath + ':' + line) === -1) {
                                                arr.push(eachPath + ':' + line);
                                            }
                                            translations[toTranslate].comments.reference = arr.join('\n');
                                        }
                                        else {
                                            translations[toTranslate] = {
                                                msgid: toTranslate,
                                                comments: {
                                                    reference: eachPath + ':' + line
                                                },
                                                msgstr: ['']
                                            };
                                        }
                                        this.break;
                                    }
                                }
                            });
                            result = poGenerator.generate(translations, opts);
                        }
                        break;
                    case 'tpl':
                    case 'html':
                        result = jsxgettext.parse.apply(jsxgettext, jsxgettextParsers.etpl(data[type], opts));
                        break;
                }

                // 修正数据
                util.extend(result.headers, {
                    'project-id-version': opts.info || 'PACKAGE VERSION',
                    'language-team': 'LANGUAGE <infe@baidu.com>',
                    'report-msgid-bugs-to': 'Leo Wang(wangkemiao@baidu.com)',
                    'po-revision-date': 'YEAR-MO-DA HO:MI+ZONE',
                    'language': 'zh-cn',
                    'mime-version': '1.0',
                    'content-type': 'text/plain; charset=utf-8',
                    'content-transfer-encoding': '8bit',
                    'pot-creation-date': new Date().toISOString().replace('T', ' ').replace(/:\d{2}.\d{3}Z/, '+0000')
                });

                // 输出
                var toWrite = gettextParser.po.compile(result).toString();
                if (opts.o !== true) {
                    console.log(toWrite);
                }
                else {
                    write(path.join(opts.outputDir || '', opts.output), toWrite);
                }
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
