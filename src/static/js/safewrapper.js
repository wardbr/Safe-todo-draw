let AppToken
let SmdHandle
let SentriesHandle

const SAFE_LIST_KEY = 'key_TodoMVC'

async function GetListEntry() {
  try {
    const value = await window.safeMutableDataEntries.get(SentriesHandle, SAFE_LIST_KEY)
    //window.alert('key_todo, version: ' + value.version + ', value: ' + value.buf.toString())
  } catch(err) {
    //window.alert('key_todo create before mutate: err' + err)
    //'key_todo' doesn't exist yet: create it
    const mut_handle = await window.safeMutableDataEntries.mutate(SentriesHandle)

    if(!mut_handle){ window.alert('empty mut_handle') }

    await window.safeMutableDataMutation.insert(mut_handle, SAFE_LIST_KEY, 'init todo')
    //window.alert('before applyEntriesMutation')
    await window.safeMutableData.applyEntriesMutation(SmdHandle, mut_handle)
    //window.alert('New entry inserted')
    window.safeMutableDataMutation.free(mut_handle)
  }
}
async function InitMData() {
  try {
    const container = '_public'
    SmdHandle = await window.safeApp.getContainer(AppToken, container)
    //window.alert('getContainer' + container + ', ok')
    //window.safeMutableData.getNameAndTag(SmdHandle)
    //.then((r) => window.alert('MutableData tag: ' + r.tag + ' and name: ' + r.name.buffer))
    //.then(_ => window.safeMutableData.getVersion(SmdHandle))
    //.then((version) => window.alert('MutableData current version: ' + version))
    //Retrieving the entries
    SentriesHandle = await window.safeMutableData.getEntries(SmdHandle)
    if(!SentriesHandle) {
      window.alert('safeMutableData.getEntries returns nothing')
    }

    window.alert('ok')
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

    GetListEntry()

    //const value = await window.safeMutableDataEntries.get(SentriesHandle, 'key_todo')
    /*if(value) {
      window.alert('key_todo, version: ' + value.version + ', value: ' + value.buf.toString())
    } else {
      //'key_todo' doesn't exist yet: create it
      //using window.safeMutableDataEntries.insert instead: no error msg,
      //  but doesn't seem to be applied -> key is not found at next visit of the site
      const mut_handle = await window.safeMutableDataEntries.mutate(SentriesHandle)

      await window.safeMutableDataMutation.insert(mut_handle, 'SAFE_LIST_KEY 'init todo')
      await window.safeMutableData.applyEntriesMutation(SmdHandle, mut_handle)
      window.alert('New entry inserted')
      window.safeMutableDataMutation.free(mut_handle)
    }*/
    //window.safeMutableData.free(mdHandle)
  } catch(err) {
    window.alert('InitMData error: ' + err)
  }
}

const InitSafe = async () => {
  try {
    const app_info = {
      name: 'TodoMVC Vue.js',
      id: 'TodoMVC.Vue.js.webapp',
      version: '0.1.0',
      vendor: 'Bedraw'
    }
    const access = {
      '_public': ['Read', 'Insert', 'Delete', 'ManagePermissions']
    }
    const options = { own_container: false }

    AppToken = await window.safeApp.initialise(app_info)
    //window.alert('Application Token received: ' + AppToken)

    const auth_uri = await window.safeApp.authorise(AppToken, access, options)
    //window.alert('auth_uri' + auth_uri)

    await window.safeApp.connectAuthorised(AppToken, auth_uri)
    InitMData()
  } catch(err) {
    window.alert('InitSafe error: ' + err)
  }
}
export { InitSafe }
//export const InitSafe = InitSafeL()
//const MUTABLE_DATA_ENTRIES = { key1: 'value1', key2: 'value2' }
//
//function CreateToDoEntry(mdhandle) {
//  window.safeMutableData.quickSetup(mdhandle, MUTABLE_DATA_ENTRIES)
//    .then(_ => {
//      window.safeMutableData.get(mdhandle, 'key1')
//        .then((value) => {
//          window.alert('Value: ' + value.buf.toString())
//          window.alert('Version: ' + value.version)
//        })
//    }, (err) => {
//      window.alert('Error safeMutableData.quickSetup: ' + err)
//    })
//}

export const FreeSafe = () => {
  //fu Freesafe called with every load/refresh, immediately after InitSafe call: not useful
  //window.alert('free')
  //window.safeApp.free(AppToken)
}
