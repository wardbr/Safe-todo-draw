// In this file all beaker-plugin-safe-app wrapper functions

// an IIFE Anonymous Function: https://github.com/tastejs/todomvc/blob/master/codestyle.md
(function (exports) {
  'use strict'

  let SmdHandle
  let Sentries
  let AppConnected

  const SAFE_LIST_KEY = 'key_TodoMVC'

  async function GetListEntrySafe (getType) {
    let rc = ''
    try {
      const value = await Sentries.get(SAFE_LIST_KEY)
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
        const mutHandle = await Sentries.mutate(Sentries)
        if (!mutHandle) {
          window.alert('GetListEntrySafe entry:' + SAFE_LIST_KEY + ', getType: ' + getType + ': mutHandle null')
        } else {
          rc = '[]'
          await mutHandle.insert(SAFE_LIST_KEY, rc)
          await SmdHandle.applyEntriesMutation(mutHandle)
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
      SmdHandle = await AppConnected.auth.getContainer(container)

      // const r = await SmdHandle.getNameAndTag()
      // console.log('MutableData tag: ' + r.tag + ' and name: ' + r.name.buffer)
      // const version = await SmdHandle.getVersion()
      // console.log('MutableData current version: ' + version)

      Sentries = await SmdHandle.getEntries()
      if (!Sentries) {
        window.alert('InitMData: safeMutableData.getEntries returns nothing')
      }
      console.log('Sentries: ', Sentries)

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
          version: '0.3.3',
          vendor: 'Bedraw'
        }
        const containerPermissions = {
          '_public': ['Read', 'Insert', 'Update', 'Delete', 'ManagePermissions']
        }
        const authorisationOptions = { own_container: false }

        const app = await safe.initialiseApp(appInfo)
        console.log('after app = safe.initialiseApp')

        const authReqUri = await app.auth.genAuthUri(containerPermissions, authorisationOptions)
        console.log('after app.auth.genAuthUri')

        const authUri = await safe.authorise(authReqUri)
        AppConnected = await app.auth.loginFromUri(authUri)

        return await InitMData()
      } catch (err) {
        window.alert('safeWrap.init error: ' + err)
        return null
      }
    },

    setList: async function (value) {
      try {
        const mutHandle = await AppConnected.mutableData.newMutation()
        const prevValue = await SmdHandle.get(SAFE_LIST_KEY)
        const newVersion = prevValue.version + 1
        console.log('safeWrap.setList entry: ' + SAFE_LIST_KEY + ', version: ' + newVersion + ', value: ' + value)
        await mutHandle.update(SAFE_LIST_KEY, value, newVersion)
        await SmdHandle.applyEntriesMutation(mutHandle)
      // code below gives error below:
      // safeWrap.setList error: -107: Core error: Routing client error -> Entry actions are invalid: {[107, 101, 121, 95, 84, 111, 100, 111, 77, 86, 67]: InvalidSuccessor(21)}
      // ->therefore switched to code above
      /* if(Sentries) {
        let version = await GetListEntrySafe('version')
        if(version) {
          const mutHandle = await Sentries.mutate()
          console.log('safeWrap.setList entry: ' + SAFE_LIST_KEY + ', version: ' + version + ', value: ' + value)
          await mutHandle.update(SAFE_LIST_KEY, value, version + 1)
          await SmdHandle.applyEntriesMutation(mutHandle)
        }
      } else {
        window.alert('safeWrap.setList Sentries null')
      } */
      } catch (err) {
        window.alert('safeWrap.setList error: ' + err)
      }
    }
  }
}(window))
