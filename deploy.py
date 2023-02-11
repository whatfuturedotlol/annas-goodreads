import json, re
from zipfile import ZipFile

F_USERSCRIPT_HEADER0 = "userscript_header.js"
INLINE_VAR_REGEX = re.compile('"(CONFIG|MANIFEST):(\w+)"')
ZIPFILE0 = "annas-archive_v{}.zip"

def deploy_addon(manifest):
    version = manifest["version"]
    files0 = [
        "manifest.json",
        manifest["content_scripts"][0]["js"][0],
        manifest["web_accessible_resources"][0]
    ]

    zipfile0 = ZIPFILE0.format(version)
    with ZipFile(zipfile0, "w") as zipfile:
       for file0 in files0:
           zipfile.write(file0)

    print("Deployed add-on: " + zipfile0)

def deploy_userscript(manifest):
    config = {
        "match": manifest["content_scripts"][0]["matches"][0]
    }

    f_js0 = manifest["content_scripts"][0]["js"][0]
    with open(f_js0, "r") as f_js:
        js = f_js.read()

    with open(F_USERSCRIPT_HEADER0, "r") as f_userscript_header:
        userscript_header = f_userscript_header.read()

    matches = INLINE_VAR_REGEX.findall(userscript_header)
    for location, var in matches:
        str_a = '"{}:{}"'.format(location, var)
        if location == "MANIFEST":
            str_b = manifest[var]
        elif location == "CONFIG":
            str_b = config[var]

        userscript_header = userscript_header.replace(str_a, str_b)

    js = userscript_header + "\n" + js
    f_js0 = f_js0[:-3] + ".user.js"
    with open(f_js0, "w") as f_js:
        f_js.write(js)

    print("Deployed userscript: " + f_js0)

def main():
    with open("manifest.json", "r") as f_manifest:
        manifest = json.load(f_manifest)

    deploy_addon(manifest)
    deploy_userscript(manifest)

if __name__ == "__main__":
    main()
