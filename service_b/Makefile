cnf ?= .env
include $(cnf)

.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

build: 
	docker buildx build --platform linux/amd64,linux/arm64 -t atamos/$(APP_NAME) -o type=registry .

build-nc:
	docker build --no-cache -t $(APP_NAME) .

deploy: 
	kubectl apply -f deployment.yaml

clean: 
	kubectl delete -f deployment.yaml

all: build clean deploy