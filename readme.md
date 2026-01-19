# RUNALL

## example

```package.json
"scripts": {
    "dev-api": "cross-env NODE_ENV=development nodemon --exec ts-node src/api.ts",
    "dev-tcp": "cross-env NODE_ENV=development nodemon --exec ts-node src/tcp.ts",
}
```

**run**
```
runallx yarn dev-api dev-tcp
```

