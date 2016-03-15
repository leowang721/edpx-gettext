/**
 * @file edp gettext gen po
 * @author Leo Wang(leowang721@gmail.com)
 */

exports.cli = {
    description: 'see: egettext generate --help',
    options: ['force', 'keyword:', 'info:', 'o'],
    main: function (args, opts) {
        require('../../lib/gettext/generate').process(args, opts);
    }
};
