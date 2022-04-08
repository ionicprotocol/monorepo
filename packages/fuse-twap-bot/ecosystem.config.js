module.exports = {
  apps: [
    {
      name: 'fuse-twap-bot',
      script: 'node',
      args: 'build/index.js',

      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      // args: 'one two',
      // instances: 1,
      // autorestart: true,
      // watch: false,
      // max_memory_restart: '1G',
      time: true,
      env: {
        NODE_ENV: 'development',
        DEFAULT_MIN_PERIOD: 1800,
        DEFAULT_DEVIATION_THRESHOLD: 0.05,
        TWAP_UPDATE_ATTEMPT_INTERVAL_SECONDS: 5,
        SPEED_UP_TRANSACTION_AFTER_SECONDS: 120,
        REDUNDANCY_DELAY_SECONDS: 0, // Set to an integer greater than 0 to delay posting TWAPs for redundancy
      },
      env_production: {
        NODE_ENV: 'production',
        DEFAULT_MIN_PERIOD: 1800,
        DEFAULT_DEVIATION_THRESHOLD: 0.05,
        TWAP_UPDATE_ATTEMPT_INTERVAL_SECONDS: 30,
        SPEED_UP_TRANSACTION_AFTER_SECONDS: 120,
        REDUNDANCY_DELAY_SECONDS: 0, // Set to an integer greater than 0 to delay posting TWAPs for redundancy
      },
    },
  ],
};
