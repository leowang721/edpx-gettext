/**
 * @file edp gettext topo
 * @author Leo Wang(leowang721@gmail.com)
 */

exports.cli = {
    description: '将一个 .json 文件 转换成 .po',
    options: ['keyword:', 'info:', 'o', 'json'],
    main: function (args, opts) {
        require('../../lib/gettext/transform/topo').process(args, opts);
    }
};
