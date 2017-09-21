// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.
// changed by draw: store list to SAFE network instead of local

let SappToken
let SmdHandle
let SentriesHandle

const MUTABLE_DATA_ENTRIES = { key1: 'value1', key2: 'value2' }

function CreateToDoEntry(mdhandle) {
  window.safeMutableData.quickSetup(mdhandle, MUTABLE_DATA_ENTRIES)
    .then(_ => {
      window.safeMutableData.get(mdhandle, 'key1')
        .then((value) => {
          window.alert('Value: ' + value.buf.toString())
          window.alert('Version: ' + value.version)
        })
    }, (err) => {
      window.alert('Error safeMutableData.quickSetup: ' + err)
    })
}

function InitMData() {
  //What I didn't get to work:
  //1) window.safeApp.getHomeContainer(SappToken) doesn't work or only on very first try
  //2) ... newPrivate: first argument wrong type: maybe an api error!!
  //3) and ...newPublic: isn't unique for each account, without something
  //     random -> how introduce and store that in webpage, withoud '_public' container
  const container = '_public'
  window.safeApp.getContainer(SappToken, container)
    .then((mdHandle) => {
      SmdHandle = mdHandle
      window.alert('getContainer' + container + ', ok')
      //window.safeMutableData.getNameAndTag(SmdHandle)
      //.then((r) => window.alert('MutableData tag: ' + r.tag + ' and name: ' + r.name.buffer))
      //.then(_ => window.safeMutableData.getVersion(SmdHandle))
      //.then((version) => window.alert('MutableData current version: ' + version))
      //Retrieving the entries
      window.safeMutableData.getEntries(SmdHandle)
        .then((entriesHandle) => {
          SentriesHandle = entriesHandle
          //when trying to read existing entries: len forEach wasn't run through: no values printed
          //window.safeMutableDataEntries.len(SentriesHandle)
          //  .then((len) => window.alert('Number of entries in the MutableData: ' + len))
          //  .then(_ => window.safeMutableDataEntries.forEach(SentriesHandle, (k, v) => {
          //    window.alert('Key: ' + k.toString())
          //    window.alert('Value: ' + v.buf.toString())
          //    window.alert('Version: ' + v.version)
          //    }).then(_ => window.alert('Iteration finished'))
          //  )
          //  //window.safeMutableDataEntries.free(SentriesHandle)
          window.safeMutableDataEntries.get(SentriesHandle, 'key_todo')
            .then((value) => {
              window.alert('key_todo, version: ' + value.version + ', value: ' + value.buf.toString())
            }, (err) => {
              //'key_todo' doesn't exist yet: create it
              //using window.safeMutableDataEntries.insert instead: no error msg,
              //  but doesn't seem to be applied -> key is not found at next visit of the site
              window.safeMutableDataEntries.mutate(SentriesHandle)
                .then((h) => mutationHandle = h)
                .then(_ => window.safeMutableDataMutation.insert(mutationHandle, 'key_todo', 'init todo'))
                .then(_ => window.safeMutableData.applyEntriesMutation(SmdHandle, mutationHandle))
                .then(_ => window.alert('New entry inserted'))
                .then(_ => window.safeMutableDataMutation.free(mutationHandle))
            })
        }, (err) => {
          window.alert('Error safeMutableData.getEntries: ' + err)
        })
      //window.safeMutableData.free(mdHandle)
    }, (err) => {
      window.alert('Error safeApp.getContainer(' + container + '): ' + err)
    })
    .catch((err) => {
      window.alert('Catched error InitMData: ' + err)
    })
}
function InitSafe() {

  const appInfo = {
    name: 'todo draw',
    id: 'todo.draw.webapp.example1',
    version: '0.1.0',
    vendor: 'Bedraw'
  }
  const access = {
    '_public': ['Read', 'Insert', 'Delete', 'ManagePermissions']
  }
  const options = { own_container: true }

  window.safeApp.initialise(appInfo)
    .then((appToken) => {
      SappToken = appToken
      //window.alert('Application Token received: ' + appToken)
      window.safeApp.authorise(SappToken, access, options)
        .then((authURI) => {
          //window.alert('Application was authorised by user. Auth URI received:' + authURI)
          window.safeApp.connectAuthorised(SappToken, authURI)
            .then(_ => {
              //window.alert('Application is now registered in the network')

              //only container '_public' exists
              //window.safeApp.getContainersNames(SappToken)
              //.then((names) => window.alert('names: ' + JSON.stringify(names)))
              //.then(InitMData())

              InitMData()
            }
              , (err) => {
              window.alert('Application connectAuthorised was rejected')
            })
        }, (err) => {
          windows.alert('Application authorisation was rejected: ' + err)
        })
    }
    )
    .catch((err) => {
      window.alert('Error from webapp: ' + err)
    })
  //}
}
function FreeSafe() {
  //fu Freesafe called with every load/refresh, immediately after InitSafe call: not useful
  //window.alert('free')
  //window.safeApp.free(SappToken)
}
// localStorage persistence
var STORAGE_KEY = 'todos-vuejs-2.0'
var todoStorage = {
  fetch: function () {
    //todo: fetch from SAFE network instead
    var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    todos.forEach(function (todo, index) {
      todo.id = index
    })
    todoStorage.uid = todos.length

    return todos
  },
  save: function (todos) {
    //todo: store to SAFE network instead
    var stodos = JSON.stringify(todos)
    //window.alert(stodos)
    localStorage.setItem(STORAGE_KEY, stodos)
  }
}

// visibility filters
var filters = {
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
var app = new Vue({
  // app initial state
  //el: "#apptodo",
  data: {
    todos: todoStorage.fetch(),
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  },

  beforeCreate: InitSafe(),
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
      var value = this.newTodo && this.newTodo.trim()
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
  destroyed: FreeSafe()
})

// handle routing
function onHashChange () {
  var visibility = window.location.hash.replace(/#\/?/, '')
  if (filters[visibility]) {
    app.visibility = visibility
  } else {
    window.location.hash = ''
    app.visibility = 'all'
  }
}

window.addEventListener('hashchange', onHashChange)
onHashChange()

// mount
app.$mount('.todoapp')

