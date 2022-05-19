const path = require('path');

module.exports = {
  i18n: {
    locales: ['default', 'en'],
    defaultLocale: 'default',
    localeDetection: false,
    localePath: path.resolve('.packages/ui/public/locales'),
  },
  trailingSlash: true,
};
