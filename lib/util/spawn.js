/**
 * @file 执行外部命令
 * @author firede[firede@firede.us]
 *         Leo Wang(leowang721@gmail.com)
 */

var spawn = require('child_process').spawn;
var extend = require('./index').extend;
var promise = require('node-promise');

/**
 * 子进程调用，以Promise的形式返回
 *
 * @param {string} command 命令
 * @param {Array} args 参数
 * @param {Object} opts 选项
 *
 * @return {Promise}
 */
module.exports = function (command, args, opts) {
    var winCmd = process.env.comspec;
    var osCommand = winCmd ? winCmd : command;
    var osArgs = winCmd ? ['/c'].concat(command, args) : args;
    opts = opts || {};

    var deferred = promise.defer();
    var thead = spawn(
        osCommand,
        osArgs,
        extend({
            stdio: 'inherit',
            cwd: process.cwd()
        }, opts)
    );

    thead.on('close', function (code) {
        if (code !== 0) {
            console.log('edp process exited with code ' + code);
            deferred.reject();
        }
        else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};
