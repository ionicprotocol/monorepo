.PHONY: help install clean local-service docker-build-celery docker-build-service docker-push-service docker-push-celery test-service

.DEFAULT_GOAL := help
SHELL := /bin/bash
PATH := ${PWD}/venv/bin:${PATH}
PYTHONPATH := ${PWD}:${PYTHONPATH}
AWS_DEFAULT_REGION = eu-central-1

include .common.env

ifdef ENV
include .${ENV}.env
endif

export


BOLD=$(shell tput -T xterm bold)
RED=$(shell tput -T xterm setaf 1)
GREEN=$(shell tput -T xterm setaf 2)
YELLOW=$(shell tput -T xterm setaf 3)
RESET=$(shell tput -T xterm sgr0)

help:
	@awk 'BEGIN {FS = ":.*?##-.*?local.*?- "} /^[a-zA-Z_-]+:.*?##-.*?local.*?- / \
	{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "${YELLOW}ENV=data${RESET}"
	@awk 'BEGIN {FS = ":.*?##-.*?data.*?- "} /^[a-zA-Z_-]+:.*?##-.*?data.*?- / \
	{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "${YELLOW}ENV=sandbox${RESET}"
	@awk 'BEGIN {FS = ":.*?##-.*?sandbox.*?- "} /^[a-zA-Z_-]+:.*?##-.*?sandbox.*?- / \
	{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)


check-%:
	@if [ "${${*}}" = "" ]; then \
		echo -e "${RED} Variable $* not set ❌${RESET}"; \
		exit 1; \
	fi

nosudo:
	@if [ $(shell whoami) = root ]; then \
		echo -e "${RED} This command should not be run as root ❌${RESET}"; \
		exit 1; \
	fi

# -------------------------------------------------------------------
# DEPLOY
# -------------------------------------------------------------------

plan:
	export TF_VAR_ethereum_admin_account=${ETHEREUM_ADMIN_ACCOUNT} && \
	export TF_VAR_ethereum_admin_private_key=${ETHEREUM_ADMIN_PRIVATE_KEY} && \
	export TF_VAR_moralis_api_key=${MORALIS_API_KEY} && \
	export TF_VAR_pokt_api_key=${POKT_API_KEY} && \
	export TF_VAR_getblock_api_key=${GETBLOCK_API_KEY} && \
	export TF_VAR_nodereal_bsc_api_key=${NODEREAL_MATIC_API_KEY} && \
	export TF_VAR_nodereal_matic_api_key=${NODEREAL_BSC_API_KEY} && \
	export TF_VAR_twap_bot_image=${TWAP_BOT_IMAGE} && \
	export TF_VAR_liquidator_bot_image=${LIQUIDATOR_BOT_IMAGE} && \
	export TF_VAR_oracles_monitor_image=${ORACLES_MONITOR_IMAGE} && \
	export TF_VAR_discord_webhook_url=${DISCORD_WEBHOOK_URL} && \
	export TF_VAR_supabase_key=${SUPABASE_KEY} && \
	terraform init && \
	terraform plan


deploy:
	export TF_VAR_ethereum_admin_account=${ETHEREUM_ADMIN_ACCOUNT} && \
	export TF_VAR_ethereum_admin_private_key=${ETHEREUM_ADMIN_PRIVATE_KEY} && \
	export TF_VAR_moralis_api_key=${MORALIS_API_KEY} && \
	export TF_VAR_pokt_api_key=${POKT_API_KEY} && \
	export TF_VAR_getblock_api_key=${GETBLOCK_API_KEY} && \
	export TF_VAR_nodereal_bsc_api_key=${NODEREAL_MATIC_API_KEY} && \
	export TF_VAR_nodereal_matic_api_key=${NODEREAL_BSC_API_KEY} && \
	export TF_VAR_twap_bot_image=${TWAP_BOT_IMAGE} && \
	export TF_VAR_liquidator_bot_image=${LIQUIDATOR_BOT_IMAGE} && \
	export TF_VAR_oracles_monitor_image=${ORACLES_MONITOR_IMAGE} && \
	export TF_VAR_discord_webhook_url=${DISCORD_WEBHOOK_URL} && \
	export TF_VAR_supabase_key=${SUPABASE_KEY} && \
	terraform init && \
	terraform apply -auto-approve


# -------------------------------------------------------------------
# DEPLOY
# -------------------------------------------------------------------


destroy:
	export TF_VAR_ethereum_admin_account=${ETHEREUM_ADMIN_ACCOUNT} && \
	export TF_VAR_ethereum_admin_private_key=${ETHEREUM_ADMIN_PRIVATE_KEY} && \
	terraform init && \
	terraform destroy


fuse-liquidator-bot-smoke-test:
	@docker run -t --entrypoint node \
				-e ETHEREUM_ADMIN_ACCOUNT=${ETHEREUM_ADMIN_ACCOUNT} \
				-e ETHEREUM_ADMIN_PRIVATE_KEY=${ETHEREUM_ADMIN_PRIVATE_KEY} \
				-e WEB3_HTTP_PROVIDER_URL="https://bsc-mainnet.nodereal.io/v1/${NODEREAL_BSC_API_KEY}" \
				-e TARGET_CHAIN_ID=56 \
				${LIQUIDATOR_BOT_IMAGE} build/test/run.js


fuse-twap-bot-smoke-test:
	@docker run -t --entrypoint node \
				-e ETHEREUM_ADMIN_ACCOUNT=${ETHEREUM_ADMIN_ACCOUNT} \
				-e ETHEREUM_ADMIN_PRIVATE_KEY=${ETHEREUM_ADMIN_PRIVATE_KEY} \
				-e WEB3_HTTP_PROVIDER_URL="https://bsc-mainnet.nodereal.io/v1/${NODEREAL_BSC_API_KEY}" \
				-e TARGET_CHAIN_ID=56 \
				-e SUPPORTED_PAIRS="0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6|0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c" \
				${TWAP_BOT_IMAGE} build/test/run.js


oracles-monitor-smoke-test:
	@docker run -t --entrypoint node \
				-e ETHEREUM_ADMIN_ACCOUNT=${ETHEREUM_ADMIN_ACCOUNT} \
				-e ETHEREUM_ADMIN_PRIVATE_KEY=${ETHEREUM_ADMIN_PRIVATE_KEY} \
				-e SUPABASE_KEY=${SUPABASE_KEY} \
				-e WEB3_HTTP_PROVIDER_URL="https://bsc-mainnet.nodereal.io/v1/${NODEREAL_BSC_PI_KEY}" \
				-e TARGET_CHAIN_ID=56 \
				${ORACLES_MONITOR_IMAGE} build/test/run.js
