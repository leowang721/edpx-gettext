/**
 * @file edp gettext tojson
 * @author Leo Wang(leowang721@gmail.com)
 */

exports.cli = {
    description: '将一个 .po 文件 转换成 .json',
    options: ['keyword:', 'info:', 'o', 'json', 'amd'],
    main: function (args, opts) {
        require('../../lib/gettext/transform/tojson').process(args, opts);
    }
};
