# servicemesh
A complete servicemesh architecture example

## Install kuma service mesh 

Install [kuma](http://kuma.io) service mesh with [helm](https://helm.sh/) 

```shell
$ helm repo add kuma https://kumahq.github.io/charts
$ helm install --create-namespace --namespace kuma-system kuma kuma/kuma  -f values.yaml
```
