.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

build: 
	docker build -t nginxfront .

deploy: 
	kubectl apply -f deployment.yaml

clean: 
	kubectl delete -f deployment.yaml

all: build clean deploy