/**
 * @file edp egettext generate parsers
 * @author Leo Wang(wangkemiao@baidu.com)
 */

function parseEtpl(str, options) {
    var lines = str.split('\n');

    options = options || {};
    var open = options.open || '${';
    var close = options.close || '}';
    var prefix = options.prefix || 'i18n';
    var regStr = open + prefix + '\\.' + '([^\\}]+)' + close;
    regStr = regStr.replace('$', '\\$').replace('{', '\\{').replace('}', '\\}');
    var variableRegex = new RegExp(regStr, 'g');

    var result = [];
    lines.forEach((eachLine) => {
        // 只要行号就好了，所以只保留内嵌变量的内容，其他都扔掉
        var newLine = '';
        var currentResult = variableRegex.exec(eachLine);
        while (currentResult) {
            newLine += '_("' + currentResult[1] + '");';  // 模拟出来一个假的可以识别的格式
            currentResult = variableRegex.exec(eachLine);
        }
        newLine += '\n';
        result.push(newLine);
    });

    return result.join('');
}

/* global exports */
exports.etpl = function ETPL(ejsSources, options) {
    Object.keys(ejsSources).forEach(function (filename) {
        ejsSources[filename] = parseEtpl(ejsSources[filename]);
    });

    return [ejsSources, options];
};
