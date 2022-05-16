#!/usr/bin/env bash


PORT=8545
SERVICE="hardhat"

echo "Testing for connectivity for service ${SERVICE} at port ${PORT}"

function wait_for_service() {
    local attempt=1

    until curl -f --max-time 1 "http://${SERVICE}:${PORT}/ping" &>/dev/null; do
        echo "${attempt}/12: Service not up, sleeping $(( attempt + 10 )) seconds..."
        sleep $(( attempt + 10 ))
        attempt=$((attempt + 1))
        if [[ ${attempt} == 12 ]]
        then
            echo -e "\033[31mERROR\033[m: Waited too long for ${SERVICE} to become available!"
            exit 1
        fi
    done
}

wait_for_service
