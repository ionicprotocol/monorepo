#!/usr/bin/env bash

set -e

./wait-for-hh.sh

while ping -c1 e2e &>/dev/null
do echo "Pools are being set up"; sleep 1;
done;

echo 'Finish setting up pools, starting liquidations...'

pm2-runtime ecosystem.config.js --env development