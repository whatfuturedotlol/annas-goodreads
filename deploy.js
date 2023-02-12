const fs = require("fs")
const JSZip = require("jszip")

// filenames: in
const PACKAGE0 = "./package.json"
const JS_SKEL0 = "./rsc/annas_goodreads_skel.js"
const MANIFEST_SKEL0 = "./rsc/manifest_skel.json"
const ADDON_HEADER0 = "./rsc/addon_header.js"
const USERSCRIPT_HEADER0 = "./rsc/userscript_header.js"
const ICON0 = "./addon/annas-archive-favicon.png"

// filenames: out
const USERSCRIPT0 = "./annas_goodreads.user.js"
const ADDON_JS0 = "./addon/annas_goodreads.js"
const MANIFEST0 = "./addon/manifest.json"
const ARCHIVE0 = "annas-goodreads_v{}.zip"

const INLINE_VAR_REGEX = /"([A-Z]+):(\w+)"/g

function generateAddon(skel, config) {
  skel = skel.replace(/"USERSCRIPT:\w+"\n/g, "")
  return resolveAllVars(skel, config)
}

function generateManifest(skel, config) {
  return resolveAllVars(skel, config, true)
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

function resolveAllVars(skel, config, quotes = false) {
  const matches = [...skel.matchAll(INLINE_VAR_REGEX)] 
  matches.forEach(match => {
    let result = resolveVar(match, config)
    if (quotes) result = "\"" + result + "\""
    skel = skel.replace(match[0], result)
  })
  return skel
}

function strippedFileName(path) {
  return path.match(/[^\/]+\.[^\/]+$/gm)[0]
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

  // save files
  fs.writeFileSync(ADDON_JS0, addon)
  fs.writeFileSync(MANIFEST0, manifest)
  fs.writeFileSync(USERSCRIPT0, userscript)

  // generate zip archive
  let zip = new JSZip()
    .file(strippedFileName(MANIFEST0), manifest)
    .file(strippedFileName(ADDON_JS0), addon)
    .file(strippedFileName(ICON0), fs.readFileSync(ICON0))

  // save zip archive
  const archive0 = ARCHIVE0.replace("{}", config.package.version)
  zip.generateNodeStream({ type: "nodebuffer", streamFiles: true })
    .pipe(fs.createWriteStream(archive0))
    .on("finish", () => {
      console.log("Created archive: " + archive0)
    })
}

if (require.main === module) 
  main()

