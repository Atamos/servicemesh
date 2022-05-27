# servicemesh
A complete servicemesh architecture example


This repo install many different services 

- [Kuma](https://kuma.io/) as service mesh
- [Envoy](https://www.envoyproxy.io/) as sidecar proxy 
- [Prometeus](https://prometheus.io/) for monitoring 
- [Grafana](https://grafana.com/) as dashboard
- [Jager](https://www.jaegertracing.io/) as distribuite tracing 
- [zipkin](https://zipkin.io/pages/architecture.html) as collector
- [Loki](https://grafana.com/docs/loki/latest) as log collector
- [Kafka](https://kafka.apache.org) as message bus
- [Zookeeper](https://zookeeper.apache.org/) with kafka
- [Schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html) from confluent 
- [Avro](https://avro.apache.org/docs/1.2.0/) As message format
- [Akhq](https://akhq.io/) as kafka dashboar
- [Opa](https://www.openpolicyagent.org/) as rule system
- [Graphql](https://graphql.org/) as demo api
- [Apollo router](https://www.apollographql.com/docs/router/) for supergraph
- [Opal] (https://www.opal.ac/) as open policy administration layer
- [kong](https://konghq.com/install#kong-community) as api gw 
- [curity](https://curity.io/) as idp 
- [nodejs](https://nodejs.org/en/) as service language
 
## Install kuma service mesh 

Install [kuma](http://kuma.io) service mesh with [helm](https://helm.sh/) 

```shell
$ helm repo add kuma https://kumahq.github.io/charts
$ helm install --create-namespace --namespace kuma-system kuma kuma/kuma  -f helm_values.yaml
```

Then deploy all the kuma related files 

```
$ kubectl apply -f mesh.yaml
```

And some addictional services required for enable some kuma policies
```
$ kumactl install metrics | kubectl apply -f -
$ kumactl install tracing | kubectl apply -f - 
$ kumactl install logging | kubectl apply -f -
```

And deploy other configurations
```
$ kubectl apply -f trace.yaml
$ kubectl apply -f trafficlog.yaml
```




## Install a curity as Identity Provider

[Curity](https://curity.io/) is a idp provider used in this sample. 

Install curity with helm chart

```
$ helm repo add curity https://curityio.github.io/idsvr-helm/
$ helm repo update
$ helm install idsvr-tutorial curity/idsvr \
    --set image.tag=latest \
    --set curity.config.password=Pass1 \
    --set curity.config.uiEnabled=true \
    --set networkpolicy.enabled=false \
    --set curity.admin.service.type=NodePort \ 
    --set curity.runtime.service.type=NodePort 
```

After the installation , we can import the default config located in curity directory and install a licence . 


Login with password: **Pass1**



## Kong gateway
Kong requires some addictional plugins related to [opa](https://www.openpolicyagent.org/) and phantom token plugin.

To install these plugins in kong image build a new kong image with the dockerfile 

```
$ docker buildx build --platform linux/amd64,linux/arm64 -t atamos/kong:2.5 -o type=registry .
```

Then install kong with helm chart
```
$ helm install my-kong kong/kong -n kong --values ./helm_values.yaml
```

### Install custom plugin 
Copy the source code of the plugin in kong_plugins directory and create a configmap with the plugin code

```
$ cd kong_plugins 
$ kubectl create configmap myheader2 --from-file=myheader2 -n kong
```

### Deploy kong plugins 

After installing kong we can enable plugins with 
```
$ kubectl apply -f plugins.yaml
```


## Grafana

In order to proxy grafana trough kong proxy we need to overwrite it's base path with an ingress file

```
$ cd grafana
$ kubectl apply -f ingress.yaml
```

## Prometeus

Nothing to do

## Open policy agent
 
Create a config map by configuration file 
```
$ cd opa
$ kubectl create configmap opaconfig --from-file=./config.yaml
```

Deploy a standalone version 

```
$ kubectl apply -f deployment.yaml
```

### Opa bundle policy

Opa policy is distribuited with a bundle. 
In the subdirectory bundle its possible add some policies and a specific github action deploy it a github pages

Only need to push in the bundle repo.

## Opal 
TBD

## Namespaces

Deploy namespaces  

```
$ cd namespaces
$ kubectl apply -f namespaces.yaml
```

## Graphql federation and supergraph

Install rover and router command from apollo documentation


In order to deploy a graphql superschema 

Adapt the configuration file **/graphql/supergraph-config.yaml**

Build supergraph with command 

```
./rover supergraph compose --config ./supergraph-config.yaml > supergraph.graphql
./router --supergraph supergraph.graphql
```
The output file shoul be **supergraph.graphql**


Apply the deployment file 
```
$ cd graphql && kubectl apply -f deployment.yaml
```

The deployment file deploy a new graphql router with a supergraph config and a schema file. 


## Demo Services a,b,c

Deploy services with 

```
$ make all
```


## Kafka 

Deploy kafka with deployment file 

```
 $ cd kafka 
 $ kubectl apply -f deployment.yaml
```

and the schema registry for avro

```
$ kubectl apply -f registry.yaml
```

## AkHq

Deploy kafka dashboard con 
```
$ cd akhq
$ apply -f deployment.yaml
```

or via helm chart
```
$ helm install my-akhq akhq/akhq -f  values.yaml 
```



## Interface 

Launch the demo interface 

```
cd front && npm server.js
```