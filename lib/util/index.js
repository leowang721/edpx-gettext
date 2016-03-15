/**
 * @file 公共的工具方法
 * @author Leo Wang(leowang721@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var promise = require('node-promise');
// var edp = require('edp-core');
var etpl = require('etpl');
var edpConfig = require('edp-config');
var esprima = require('esprima');
var estraverse = require('estraverse');

var util = {};

util.extend = function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i];
        if (src == null) {
            continue;
        }
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                target[key] = src[key];
            }
        }
    }
    return target;
};

/**
 * 获取语法书
 *
 * @param {string} code js代码
 * @return {*}
 */
util.getAst = function (code) {
    var ast = null;

    try {
        ast = esprima.parse(code, {
            comment: true,
            tokens: true,
            loc: true,
            ecmaVersion: 6,
            sourceType: 'module'
        });
    }
    catch (ex) {
        return null;
    }

    return ast;
};

util.traverse = function (ast, methods) {
    var enter = methods.enter;
    var leave = methods.leave;
    estraverse.traverse(ast, {
        enter: enter,
        leave: leave
    });
};

/**
 * 检查是否存在，如果存在，则提示无法继续，如果指定了force，则强行执行覆盖
 *
 * @param {string} path 目标路径
 *
 * @return {Promise}
 */
util.checkExsit = function (path) {
    var deferred = promise.defer();
    fs.exists(path, function (exsits) {
        if (exsits) {
            deferred.resolve(fs.lstatSync(path));
        }
        else {
            deferred.reject();
        }
    });
    return deferred.promise;
};

util.recursivelyReadFiles = function (targetPath, options) {
    var lstat = fs.lstatSync(targetPath);
    var files = [targetPath];
    if (lstat.isDirectory()) {
        files = fs.readdirSync(targetPath);
        files.forEach((item) => {
            util.recursivelyReadFiles(path.resolve(targetPath, item), options);
        });
    }
    else {
        if (options.filter && !options.filter(targetPath)) {
            return;
        }
        options.callback(fs.readFileSync(targetPath, {encoding: 'utf8'}), targetPath);
    }
};

/**
 * 获取要输出的文件内容
 *
 * @param {string} tplPath 模板路径
 * @param {Object} data 要输出的内容
 * @return {string}
 */
util.getToWriteData = function (tplPath, data) {
    var tplData = fs.readFileSync(tplPath).toString();
    var render = etpl.compile(tplData);
    var basicData = {
        author: edpConfig.get('user.name'),
        email: edpConfig.get('user.email')
    };

    return render(util.extend(basicData, data));
};


/**
 * 将一个符合一定规则的字符串转成`PascalCase`形式
 *
 * 输入字符串必须以空格、横线`-`或下划线`_`分割各单词，否则无法分析
 *
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.pascalize = function (s) {
    s = s + '';
    if (/^[A-Z\-_]+$/.test(s)) {
        s = s.toLowerCase();
    }
    s = s.replace(
        /[\s-_]+(.)/g,
        function (w, c) {
            return c.toUpperCase();
        }
    );
    s = s.charAt(0).toUpperCase() + s.slice(1);
    return s;
};

/**
 * 将一个符合一定规则的字符串转成`camelCase`形式
 *
 * 此方法是将{@link util#pascalize}方法的输出首字母变为小写
 *
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.camelize = function (s) {
    s = util.pascalize(s);
    return s.charAt(0).toLowerCase() + s.slice(1);
};

/**
 * 将一个符合规则的字符串转成`split-by-dash`的横线分割形式
 *
 * 具体规则参考{@link util#pascalize}方法的说明
 *
 * 在此方法中，如果字符串出现多个连续的大写字母，则会将除最后一个字符以外的子串
 * 转成小写字母后再进行分割，因为连续的大写字母通常表示一个单词的缩写，不应当拆分，
 * 如`encodeURIComponent`在经过此方法处理后会变为`encode-uri-component`，
 * 而不是`encode-u-r-i-component`，前者拥有更好的可读性
 *
 * @param {string} s 输入的字符串
 * @return {string}
 */
util.dasherize = function (s) {
    s = util.pascalize(s);
    // 这里把ABCD这种连续的大写，转成AbcD这种形式。
    // 如果`encodeURIComponent`，会变成`encodeUriComponent`，
    // 然后加横线后就是`encode-uri-component`得到正确的结果
    s = s.replace(
        /[A-Z]{2,}/g,
        function (match) {
            return match.charAt(0)
                + match.slice(1, -1).toLowerCase()
                + match.charAt(match.length - 1);
        }
    );
    // 大写字符之间用横线连起来
    s = s.replace(
        /[A-Z]/g,
        function (match) {
            return '-' + match.toLowerCase();
        }
    );
    if (s.charAt(0) === '-') {
        s = s.substring(1);
    }
    return s;
};


util.processError = function (e) {
    console.log(e);
};

module.exports = exports = util;
