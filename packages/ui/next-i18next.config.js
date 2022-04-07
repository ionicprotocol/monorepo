const path = require('path');

module.exports = {
  i18n: {
    locales: ['default', 'en', 'zh-TW', 'zh-CN'],
    defaultLocale: 'default',
    localeDetection: false,
    localePath: path.resolve('./public/locales'),
  },
  trailingSlash: true,
};
