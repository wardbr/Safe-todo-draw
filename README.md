# Safe-todo-draw
This is a Vue.js version of [TodoMVC](http://todomvc.com) with list safed on the SAFE network instead of local.

## Build Setup

When changing something in todo.js, run [ESLint](https://eslint.org/docs/user-guide/getting-started) to have the required format:
``` bash
cd static/js
#If you want to see wat changed: make a copy first.
cp todo.js todo.js.prev

eslint -c ../../.eslintrc --fix todo.js 


```

upload index.html (best change ...) and the static dir to the [Safe Network](https://maidsafe.net)
