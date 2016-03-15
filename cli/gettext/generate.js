/**
 * @file edp gettext generate
 * @author Leo Wang(leowang721@gmail.com)
 */

exports.cli = {
    description: '针对着当前项目内的源代码，生成 .po 文件',
    options: ['keyword:', 'info:', 'o', 'json'],
    main: function (args, opts) {
        require('../../lib/gettext/generate').process(args, opts);
    }
};
