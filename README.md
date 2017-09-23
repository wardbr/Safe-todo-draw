# Safe-todo-draw
This is a Vue.js version of [TodoMVC](http://todomvc.com) with the todo list saved on the SAFE Network.

## Build Setup

When changing something in file todo.js, run [ESLint](https://eslint.org/docs/user-guide/getting-started) to have the required format:
``` bash
cd src/static/js
#If you want to see afterwards what changed: make a copy first.
cp todo.js todo.prev.js
cp safe_wrapper.js safe_wrapper.prev.js

eslint -c ../../../.eslintrc --fix todo.js safe_wrapper.js


```

Upload the contents of dir src to the [SAFE Network](https://maidsafe.net)
It is good practice to change first the appInfo.name in file safe_wrapper.js.
