# Safe-todo-draw
This is a Vue.js version of [TodoMVC](http://todomvc.com) with the todo list saved on the SAFE Network.

## Build Setup

When changing something in file app.js or safe.js, run [ESLint](https://eslint.org/docs/user-guide/getting-started) to have the required format:
``` bash
cd src/static/js
#If you want to see afterwards what changed: make a copy first, e.g:.
cp app.js app.prev.js
cp safe.js safe.prev.js

eslint -c ../../../.eslintrc --fix app.js safe.js


```

Upload the contents of dir src to the [SAFE Network](https://maidsafe.net)
It is good practice to change first the appInfo.name in file safe.js.

## Some useful links

[JAVA.SCRIPT.INFO](https://javascript.info)

[modern-js-cheatsheet](https://github.com/mbeaudru/modern-js-cheatsheet)

[JavaScript Promises: an Introduction](https://developers.google.com/web/fundamentals/getting-started/primers/promises)

[JavaScript Async/Await](https://hackernoon.com/6-reasons-why-javascripts-async-await-blows-promises-away-tutorial-c7ec10518dd9)

[beaker-plugin-safe-app](http://docs.maidsafe.net/beaker-plugin-safe-app/)

