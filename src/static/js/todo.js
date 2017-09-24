// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.
// changed by draw: store list to SAFE network instead of local

let AppToken
let SmdHandle
let SentriesHandle

const SAFE_LIST_KEY = 'key_TodoMVC'

async function GetListEntrySafe(get_type) {
  let rc = ''
  try {
    //var value = await window.safeMutableDataEntries.get(SentriesHandle, SAFE_LIST_KEY)
    var value = await window.safeMutableDataEntries.get(SentriesHandle, SAFE_LIST_KEY)
    console.log('GetListEntrySafe entry: ' + SAFE_LIST_KEY + ', get_type: ' + get_type + ', version: ' + value.version + ', value: ' + value.buf.toString())
    if('version' === get_type) {
      rc = value.version
    } else {
      rc = value.buf.toString()
    }
  } catch(err) {
    if('init' === get_type) {
      console.log('GetListEntrySafe entry:' + SAFE_LIST_KEY + ', get_type: ' + get_type + ' before mutate: err: ' + err)
      var mut_handle = await window.safeMutableDataEntries.mutate(SentriesHandle)
      if(!mut_handle){
        window.alert('GetListEntrySafe entry:' + SAFE_LIST_KEY + ', get_type: ' + get_type + ': mut_handle null')
      } else {
        rc = '[]'
        await window.safeMutableDataMutation.insert(mut_handle, SAFE_LIST_KEY, rc)
        await window.safeMutableData.applyEntriesMutation(SmdHandle, mut_handle)
        window.safeMutableDataMutation.free(mut_handle)
      }
    } else {
      window.alert('GetListEntrySafe entry:' + SAFE_LIST_KEY + ' get_type: ' + get_type + ', err: ' + err)
    }
  }
  return rc
}
async function SetListSafe(value) {
  try {
    const mut_handle = await window.safeMutableData.newMutation(AppToken)
    const prev_value = await window.safeMutableData.get(SmdHandle, SAFE_LIST_KEY)
    const new_version = prev_value.version + 1
    console.log('SetListSafe entry: ' + SAFE_LIST_KEY + ', version: ' + new_version + ', value: ' + value)
    await window.safeMutableDataMutation.update(mut_handle, SAFE_LIST_KEY, value, new_version)
    await window.safeMutableData.applyEntriesMutation(SmdHandle, mut_handle)
    //code below gives error below:
    //SetListSafe error: -107: Core error: Routing client error -> Entry actions are invalid: {[107, 101, 121, 95, 84, 111, 100, 111, 77, 86, 67]: InvalidSuccessor(21)}
    //->therefore switched to code above
    /*if(SentriesHandle) {
      var version = await GetListEntrySafe('version')
      if(version) {
        const mut_handle = await window.safeMutableDataEntries.mutate(SentriesHandle)
        console.log('SetListSafe entry: ' + SAFE_LIST_KEY + ', version: ' + version + ', value: ' + value)
        await window.safeMutableDataMutation.update(mut_handle, SAFE_LIST_KEY, value, version + 1)
        await window.safeMutableData.applyEntriesMutation(SmdHandle, mut_handle)
        window.safeMutableDataMutation.free(mut_handle)
      }
    } else {
      window.alert('SetListSafe SentriesHandle null')
    }*/
  } catch(err) {
    window.alert('SetListSafe error: ' + err)
  }
}

async function InitMData() {
  let rc = '[]'
  try {
    const container = '_public'
    SmdHandle = await window.safeApp.getContainer(AppToken, container)

    //const r = await window.safeMutableData.getNameAndTag(SmdHandle)
    //console.log('MutableData tag: ' + r.tag + ' and name: ' + r.name.buffer)
    //const version = await window.safeMutableData.getVersion(SmdHandle)
    //console.log('MutableData current version: ' + version)

    SentriesHandle = await window.safeMutableData.getEntries(SmdHandle)
    if(!SentriesHandle) {
      window.alert('InitMData: safeMutableData.getEntries returns nothing')
    }
    console.log('SentriesHandle: ', SentriesHandle)

    rc = await GetListEntrySafe('init')
  } catch(err) {
    window.alert('InitMData error: ' + err)
  }
  return rc
}

//const InitSafe = async () => {
async function InitSafe() {
  try {
    const app_info = {
      name: 'TodoMVC Vue.js public',
      id: 'TodoMVC.Vue.js.webapp',
      version: '0.1.0',
      vendor: 'Bedraw'
    }
    const access = {
      '_public': ['Read', 'Insert', 'Update', 'Delete', 'ManagePermissions']
    }
    const options = { own_container: false }

    AppToken = await window.safeApp.initialise(app_info)
    console.log('Application Token received: ' + AppToken)

    const auth_uri = await window.safeApp.authorise(AppToken, access, options)
    console.log('auth_uri' + auth_uri)

    await window.safeApp.connectAuthorised(AppToken, auth_uri)
    return await InitMData()
  } catch(err) {
    window.alert('InitSafeAsync error: ' + err)
  }
}
//export { InitSafe }

//export const FreeSafe = () => {
const FreeSafe = () => {
  //fu Freesafe called with every load/refresh, immediately after InitSafe call: probably not useful
  window.safeApp.free(AppToken)
}

//retry import later --> place code above in safewrapper.js
//import {InitSafe, FreeSafe} from './safewrapper.js'
// localStorage persistence
//var STORAGE_KEY = 'todos-vuejs-2.0'


var data = {
  todos: '[]',
  newTodo: '',
  editedTodo: null,
  visibility: 'all'
}

var todoStorage = {
  //draw: musty async
  //fetch: function () {
  fetch: async function () {
    console.log('begin CLEAR fu todoStorage.fetch')
    //draw: replaced localStorage.getItem by GetListSafe, begin
    //var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    var stodos = ''
    var todos = '[]'

    stodos = await InitSafe()

    data.todos = JSON.parse(stodos || '[]')
    data.todos.forEach(function (todo, index) {
      todo.id = index
    })
    todoStorage.uid = todos.length
    console.log('todos.length: ' + todos.length)
  },
  save: function (todos) {
    var stodos = JSON.stringify(todos)
    //window.alert(stodos)
    //draw: replaced localStorage.setItem by SetListSafe
    //localStorage.setItem(STORAGE_KEY, stodos)
    SetListSafe(stodos)
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
  data: data,

  //draw: beforeCreate doesn't work, because async->todoStorage.safe called before safe connection
  //->empty list, because can't yet be fetched
  //beforeCreate: InitSafe(),

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

todoStorage.fetch().then(_ => {
  window.addEventListener('hashchange', onHashChange)
  onHashChange()
  // mount
  app.$mount('.todoapp')
}).catch((err) => {
  window.alert('Error in fu onHashChange or app.$mount: ' + err)
})
