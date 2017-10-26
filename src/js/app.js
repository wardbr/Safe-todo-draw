// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.
// changed by draw: store list to SAFE network instead of local

// global: for letting eslint know that thes functions exist
/* global Vue, safeWrap*/

// an IIFE Anonymous Function: https://github.com/tastejs/todomvc/blob/master/codestyle.md
(function () {
  'use strict'

  const data = {
    todos: '[]',
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  }

  // localStorage persistence
  // let STORAGE_KEY = 'todos-vuejs-2.0'
  const todoStorage = {
  // draw: musty async
  // fetch: function () {
    fetch: async function () {
      console.log('begin fu todoStorage.fetch')
      const todos = '[]'

      // draw: replaced localStorage.getItem() by safeWrap.init(), begin
      // data.todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const stodos = await safeWrap.init()
      data.todos = JSON.parse(stodos || '[]')
      // draw: replaced localStorage.getItem() by safeWrap.init(), end

      data.todos.forEach(function (todo, index) {
        todo.id = index
      })
      todoStorage.uid = data.todos.length
      console.log('todos.length: ' + data.todos.length)
    },
    save: function (todos) {
      const stodos = JSON.stringify(todos)
      // draw: replaced localStorage.setItem by safeWrap.setList
      // localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      safeWrap.setList(stodos)
    }
  }

  // visibility filters
  const filters = {
    all: function (todos) {
      return todos
    },
    active: function (todos) {
      return todos.filter(function (todo) {
        return !todo.completed
      })
    },
    completed: function (todos) {
      return todos.filter(function (todo) {
        return todo.completed
      })
    }
  }

  // app Vue instance
  const app = new Vue({
  // app initial state
  // el: '#apptodo',
    data: data,

    // draw: beforeCreate doesn't work, because sync and safe connection takes time and is async
    // ->empty list, because can't yet be fetched
    // beforeCreate: safeWrap.init(),

    // watch todos change for localStorage persistence
    watch: {
      todos: {
        handler: function (todos) {
          todoStorage.save(todos)
        },
        deep: true
      }
    },

    // computed properties
    // http://vuejs.org/guide/computed.html
    computed: {
      filteredTodos: function () {
        return filters[this.visibility](this.todos)
      },
      remaining: function () {
        return filters.active(this.todos).length
      },
      allDone: {
        get: function () {
          return this.remaining === 0
        },
        set: function (value) {
          this.todos.forEach(function (todo) {
            todo.completed = value
          })
        }
      }
    },

    filters: {
      pluralize: function (n) {
        return n === 1 ? 'item' : 'items'
      }
    },

    // methods that implement data logic.
    // note there's no DOM manipulation here at all.
    methods: {
      addTodo: function () {
        const value = this.newTodo && this.newTodo.trim()
        if (!value) {
          return
        }
        this.todos.push({
          id: todoStorage.uid++,
          title: value,
          completed: false
        })
        this.newTodo = ''
      },

      removeTodo: function (todo) {
        this.todos.splice(this.todos.indexOf(todo), 1)
      },

      editTodo: function (todo) {
        this.beforeEditCache = todo.title
        this.editedTodo = todo
      },

      doneEdit: function (todo) {
        if (!this.editedTodo) {
          return
        }
        this.editedTodo = null
        todo.title = todo.title.trim()
        if (!todo.title) {
          this.removeTodo(todo)
        }
      },

      cancelEdit: function (todo) {
        this.editedTodo = null
        todo.title = this.beforeEditCache
      },

      removeCompleted: function () {
        this.todos = filters.active(this.todos)
      }
    },

    // a custom directive to wait for the DOM to be updated
    // before focusing on the input field.
    // http://vuejs.org/guide/custom-directive.html
    directives: {
      'todo-focus': function (el, binding) {
        if (binding.value) {
          el.focus()
        }
      }
    },
    // destroyed doesn't seem to be loaded before a page refresh
    destroyed: safeWrap.free()
  })

  // handle routing
  function onHashChange () {
    const visibility = window.location.hash.replace(/#\/?/, '')
    if (filters[visibility]) {
      app.visibility = visibility
    } else {
      window.location.hash = ''
      app.visibility = 'all'
    }
  }

  todoStorage.fetch().then(_ => {
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
    // mount
    app.$mount('.todoapp')
  }).catch((err) => {
    window.alert('Error in fu onHashChange or app.$mount: ' + err)
  })
}())
