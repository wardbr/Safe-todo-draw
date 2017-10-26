// In this file all beaker-plugin-safe-app wrapper functions

// an IIFE Anonymous Function: https://github.com/tastejs/todomvc/blob/master/codestyle.md
(function (exports) {
  'use strict'

  let AppToken
  let SmdHandle
  let SentriesHandle

  const SAFE_LIST_KEY = 'key_TodoMVC'

  async function GetListEntrySafe (getType) {
    let rc = ''
    try {
      const value = await window.safeMutableDataEntries.get(SentriesHandle, SAFE_LIST_KEY)
      console.log('GetListEntrySafe entry: ' + SAFE_LIST_KEY + ', getType: ' + getType + ', version: ' + value.version + ', value: ' + value.buf.toString())
      if (getType === 'version') {
        rc = value.version
      } else {
        rc = value.buf.toString()
      }
    } catch (err) {
      if (getType === 'init') {
        // maybe better to replace the .safeMutableData* fu below with safeMutableData.newMutation etc,
        // like in fu safeWrap.setList to be consistent,
        // but on the other hand: here it works and maybe better example-wise to have 2 ways of doing it.
        console.log('GetListEntrySafe entry:' + SAFE_LIST_KEY + ', getType: ' + getType + ' before mutate: err: ' + err)
        const mutHandle = await window.safeMutableDataEntries.mutate(SentriesHandle)
        if (!mutHandle) {
          window.alert('GetListEntrySafe entry:' + SAFE_LIST_KEY + ', getType: ' + getType + ': mutHandle null')
        } else {
          rc = '[]'
          await window.safeMutableDataMutation.insert(mutHandle, SAFE_LIST_KEY, rc)
          await window.safeMutableData.applyEntriesMutation(SmdHandle, mutHandle)
          window.safeMutableDataMutation.free(mutHandle)
        }
      } else {
        window.alert('GetListEntrySafe entry:' + SAFE_LIST_KEY + ' getType: ' + getType + ', err: ' + err)
      }
    }
    return rc
  }
  async function InitMData () {
    let rc = '[]'
    try {
      const container = '_public'
      SmdHandle = await window.safeApp.getContainer(AppToken, container)

      // const r = await window.safeMutableData.getNameAndTag(SmdHandle)
      // console.log('MutableData tag: ' + r.tag + ' and name: ' + r.name.buffer)
      // const version = await window.safeMutableData.getVersion(SmdHandle)
      // console.log('MutableData current version: ' + version)

      SentriesHandle = await window.safeMutableData.getEntries(SmdHandle)
      if (!SentriesHandle) {
        window.alert('InitMData: safeMutableData.getEntries returns nothing')
      }
      console.log('SentriesHandle: ', SentriesHandle)

      rc = await GetListEntrySafe('init')
    } catch (err) {
      window.alert('InitMData error: ' + err)
    }
    return rc
  }

  exports.safeWrap = {
    init: async function () {
      try {
        const appInfo = {
          name: 'TodoMVC Vue.js public',
          id: 'TodoMVC.Vue.js.webapp',
          version: '0.3.0',
          vendor: 'Bedraw'
        }
        const access = {
          '_public': ['Read', 'Insert', 'Update', 'Delete', 'ManagePermissions']
        }
        const options = { own_container: false }

        AppToken = await window.safeApp.initialise(appInfo)
        console.log('Application Token received: ' + AppToken)

        const authUri = await window.safeApp.authorise(AppToken, access, options)
        console.log('authUri' + authUri)

        await window.safeApp.connectAuthorised(AppToken, authUri)
        return await InitMData()
      } catch (err) {
        window.alert('safeWrap.init error: ' + err)
        return null
      }
    },

    setList: async function (value) {
      try {
        const mutHandle = await window.safeMutableData.newMutation(AppToken)
        const prevValue = await window.safeMutableData.get(SmdHandle, SAFE_LIST_KEY)
        const newVersion = prevValue.version + 1
        console.log('safeWrap.setList entry: ' + SAFE_LIST_KEY + ', version: ' + newVersion + ', value: ' + value)
        await window.safeMutableDataMutation.update(mutHandle, SAFE_LIST_KEY, value, newVersion)
        await window.safeMutableData.applyEntriesMutation(SmdHandle, mutHandle)
      // code below gives error below:
      // safeWrap.setList error: -107: Core error: Routing client error -> Entry actions are invalid: {[107, 101, 121, 95, 84, 111, 100, 111, 77, 86, 67]: InvalidSuccessor(21)}
      // ->therefore switched to code above
      /* if(SentriesHandle) {
        let version = await GetListEntrySafe('version')
        if(version) {
          const mutHandle = await window.safeMutableDataEntries.mutate(SentriesHandle)
          console.log('safeWrap.setList entry: ' + SAFE_LIST_KEY + ', version: ' + version + ', value: ' + value)
          await window.safeMutableDataMutation.update(mutHandle, SAFE_LIST_KEY, value, version + 1)
          await window.safeMutableData.applyEntriesMutation(SmdHandle, mutHandle)
          window.safeMutableDataMutation.free(mutHandle)
        }
      } else {
        window.alert('safeWrap.setList SentriesHandle null')
      } */
      } catch (err) {
        window.alert('safeWrap.setList error: ' + err)
      }
    },

    free: function () {
      window.safeApp.free(AppToken)
    }
  }
}(window))
