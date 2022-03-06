#!/usr/bin/env bash

set -e

function wait_for_hh() {
    local attempt=1
    until curl -f --max-time 1 'http://hardhat:8545/' &>/dev/null; do
        sleep ${attempt}
        attempt=$((attempt + 1))
        if [[ ${attempt} == 12 ]]
        then
            echo -e "\033[31mERROR\033[m: Waited too long for hardhat to become available!"
            exit 1
        fi
    done
}

wait_for_hh