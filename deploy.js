const fs = require("fs")
const JSZip = require("jszip")

// filenames: in
const PACKAGE0 = "./package.json"
const JS_SKEL0 = "./rsc/annas_goodreads_skel.js"
const MANIFEST_SKEL0 = "./rsc/manifest_skel.json"
const ADDON_HEADER0 = "./rsc/addon_header.js"
const USERSCRIPT_HEADER0 = "./rsc/userscript_header.js"
const ICON0 = "./rsc/annas-archive-favicon.png"

// filenames: out
const USERSCRIPT0 = "./annas_goodreads.user.js"
const ADDON_JS0 = "./.tmp/annas_goodreads.js"
const MANIFEST0 = "./.tmp/manifest.json"
const ARCHIVE0 = "annas-goodreads_v{}.zip"

const INLINE_VAR_REGEX = /"([A-Z]+):(\w+)"/g

function generateAddon(skel, config) {
  skel = skel.replace(/"USERSCRIPT:\w+"\n/g, "")
  return resolveAllVars(skel, config)
}

function generateManifest(skel, config) {
  return resolveAllVars(skel, config)
}

function parseUserscriptHeader(skel, config) {
  let resolvedVars = resolveAllVars(skel, config)
  return resolvedVars.split("\"SPLIT\"")
}

function generateUserscript(skel, config) {
  skel = skel.replace(/"ADDON:\w+"\n/g, "")
  return resolveAllVars(skel, config)
}

function resolveVar(match, config) {
  let namespace = match[1]
  let variable = match[2]
  return config[namespace.toLowerCase()][variable]
}

function resolveAllVars(skel, config) {
  const matches = [...skel.matchAll(INLINE_VAR_REGEX)] 
  matches.forEach(match => {
    let result = resolveVar(match, config)
    skel = skel.replace(match[0], result)
  })
  return skel
}

function main() {
  let manifest = require(MANIFEST_SKEL0)
  const packagejson = require(PACKAGE0)

  let jsSkel = fs.readFileSync(JS_SKEL0, "utf-8")
  let manifestSkel = fs.readFileSync(MANIFEST_SKEL0, "utf-8")
  let addonHeader = fs.readFileSync(ADDON_HEADER0, "utf-8")
  let userscriptHeader = fs.readFileSync(USERSCRIPT_HEADER0, "utf-8")

  let config = {
    package: packagejson,
    global: { match: manifest["content_scripts"][0]["matches"][0] },
    addon: { definitions: addonHeader }
  }

  let parsedUserscriptHeader = parseUserscriptHeader(userscriptHeader, config)

  config["userscript"] = {
    header: parsedUserscriptHeader[0],
    definitions: parsedUserscriptHeader[1]
  }

  manifest = generateManifest(manifestSkel, config)
  let addon = generateAddon(jsSkel, config)
  let userscript = generateUserscript(jsSkel, config)

  // TODO: save files
  // TODO: generate archive
}

if (require.main === module) 
  main()

