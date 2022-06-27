VENV_NAME := venv
PYTHON := $(VENV_NAME)/bin/python
ALCHEMY_VERSION := $(shell $(PYTHON) -c "import ALCHEMY;print(ALCHEMY.__version__)")

RM := rm -rf

ifdef ENV
include ${ENV}.env
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


build: check-ENV
	@docker build -t fuse-oracle-monitor . \
		--build-arg ETHEREUM_ADMIN_ACCOUNT=${ETHEREUM_ADMIN_ACCOUNT} \
		--build-arg ETHEREUM_ADMIN_PRIVATE_KEY=${ETHEREUM_ADMIN_PRIVATE_KEY} \
		--build-arg WEB3_HTTP_PROVIDER_URL=${WEB3_HTTP_PROVIDER_URL}


run: check-ENV
	docker run -e NODE_ENV=$ENV -it fuse-twap-bot
