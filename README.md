# Sample project
This dummy project serves as an example for a potential npm 5 bug (npm version 5.0.3)
reported [here](https://github.com/npm/npm/issues/17405).

This project has a dependency on Package A.

Package A has a dependency on Package B.

None of these packages are published to npm, both are referenced through git. Package B is marked
as private while Package A is not, to cover both cases.

## Steps to reproduce the bug

Clone this project and run:

```
$ npm install --no-save
```

Try to execute the code:

```
$ node src
```

An error will be thrown: `Error: Cannot find module 'npm-test-package-b'`

## Why does it fail?

If you run the following command you will find that npm has deemed Package A invalid:

```
$ npm ls npm-test-package-a

npm-test-project@0.0.1 /gh/npm-test-project
└── npm-test-package-a@1.0.0  invalid (github:hector-gomez/npm-test-package-a#b8de14ec7468e359fdde791c208059c6dc5f779e)

npm ERR! invalid: npm-test-package-a@1.0.0 /gh/npm-test-project/node_modules/npm-test-package-a
```

It didn't warn us, and it did install Package A, but it didn't install its dependencies
and therefore Package B is not available.

## Time for an experiment

Delete `package-lock.json` and try to install again:

```
$ rm package-lock.json
$ npm install --no-save
added 1 package in 1.051s
```

Result: one package was added. Neat, which one? Well, it _did_ add Package B, but since it still
considers Package A invalid it marks B as extraneous:

```
$ npm ls npm-test-package-b
npm-test-project@0.0.1 /gh/npm-test-project
└─┬ npm-test-package-a@1.0.0 invalid (github:hector-gomez/npm-test-package-a#b8de14ec7468e359fdde791c208059c6dc5f779e)
  └── npm-test-package-b@1.0.1  extraneous (github:hector-gomez/npm-test-package-b#57b653e8ea863f1dc4ae46c9e4893fcef7b40d6c)

npm ERR! invalid: npm-test-package-a@1.0.0 /gh/npm-test-project/node_modules/npm-test-package-a
npm ERR! extraneous: npm-test-package-b@1.0.1 /gh/npm-test-project/node_modules/npm-test-package-b
```

At this point the dummy code in this project can be run, since Package B was actually installed
(even though npm is in a very unhappy state). You can test it with:

```
$ node src
```

## Any workaround?

Sadly, the workaround is to stop using npm's lock mechanism.

Delete the lockfile (if you hand't already) and `node_modules` (for a fresh start), then install:

```
$ rm package-lock.json
$ rm -rf node_modules
$ npm install --no-save
added 2 packages in 1.01s
```

Now it installs the same way it did when it created the lockfile, adding the two packages correctly.
If you run `npm ls` for both of them you will see that it marks the dependencies as satisfied:

```
$ npm ls npm-test-package-a npm-test-package-b
npm-test-project@0.0.1 /gh/npm-test-project
└─┬ npm-test-package-a@1.0.0  (github:hector-gomez/npm-test-package-a#b8de14ec7468e359fdde791c208059c6dc5f779e)
  └── npm-test-package-b@1.0.1  (github:hector-gomez/npm-test-package-b#57b653e8ea863f1dc4ae46c9e4893fcef7b40d6c)
```
