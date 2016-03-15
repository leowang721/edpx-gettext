/**
 * @file edp gettext generate po
 * @author Leo Wang(leowang721@gmail.com)
 */

exports.cli = {
    description: '针对着当前项目内的源代码，生成 .po 文件',
    options: ['force', 'keyword:', 'info:', 'o'],
    main: function (args, opts) {
        require('../../lib/gettext/generate').process(args, opts);
    }
};
