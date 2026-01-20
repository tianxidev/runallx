# RUNALL

## install

```
npm i -g runallx
```

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
runallx pnpm dev-api dev-tcp
runallx npm dev-api dev-tcp
```

