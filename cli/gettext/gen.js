/**
 * @file edp gettext gen po
 * @author Leo Wang(leowang721@gmail.com)
 */

exports.cli = {
    description: 'see: egettext generate --help',
    options: ['keyword:', 'info:', 'o', 'json', 'lang:', 'amd'],
    main: function (args, opts) {
        require('../../lib/gettext/generate').process(args, opts);
    }
};
