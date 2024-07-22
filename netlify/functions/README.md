# functions

## How to Run

At the root level of the monorepo:

Use this to start a local server running the functions

```sh
yarn dev:functions
```

Function will than be accessible via `localhost:8888` like so:

```sh
http://localhost:8888/.netlify/functions/FUNCTION-NAME
```

Run this command to start the `typescript` compiler in watch mode to update the locally run function code.

```sh
yarn build:functions --watch
```

## Create a New Function

All current available functions we deploy are located at:

```sh
./src/functions
```

Only functions in this folder will be deployed as netlify functions. Each file should export a singled named cost `handler`.

As of now most of the files in this `/functions` folder are just containing the `handler` export. The actual implementation of it is contained in the `./src/controllers` folder.
