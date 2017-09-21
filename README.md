# Safe-todo-draw
This is a Vue.js version of [TodoMVC](http://todomvc.com) with the list saved on the SAFE Network instead of saved local.

## Build Setup

When changing something in file todo.js, run [ESLint](https://eslint.org/docs/user-guide/getting-started) to have the required format:
``` bash
cd static/js
#If you want to see afterwards what changed: make a copy first.
cp todo.js todo.prev.js

eslint -c ../../.eslintrc --fix todo.js 


```

Upload file index.html and dir static to the [SAFE Network](https://maidsafe.net)
It is good practice to change first the appInfo.name in file todo.js.
