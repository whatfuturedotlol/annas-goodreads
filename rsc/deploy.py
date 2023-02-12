import json, re
from zipfile import ZipFile

MANIFEST0 = "manifest.json"
NPM_PACKAGE0 = "package.json"
USERSCRIPT_HEADER_FILE0 = "userscript_header.js"
INLINE_VAR_REGEX = re.compile('"(CONFIG|MANIFEST):(\w+)"')
ZIPFILE0 = "annas-goodreads_v{}.zip"

def deploy_addon(manifest):
    version = manifest["version"]
    files0 = [
        "manifest.json",
        manifest["content_scripts"][0]["js"][0],
        manifest["web_accessible_resources"][0]
    ]

    zipfile0 = ZIPFILE0.format(version)
    create_archive(files0, zipfile0)
    print("Deployed add-on: " + zipfile0)

def create_archive(files0, zipfile0):
    with ZipFile(zipfile0, "w") as zipfile:
        for file0 in files0:
            zipfile.write(file0)

def deploy_userscript(manifest):
    config = {
        "match": manifest["content_scripts"][0]["matches"][0]
    }

    f_js0 = manifest["content_scripts"][0]["js"][0]
    with open(f_js0, "r") as f_js:
        js = f_js.read()

    with open(USERSCRIPT_HEADER_FILE0, "r") as f_userscript_header:
        userscript_header = f_userscript_header.read()

    matches = INLINE_VAR_REGEX.findall(userscript_header)
    for location, var in matches:
        str_a = '"{}:{}"'.format(location, var)
        if location == "MANIFEST":
            str_b = manifest[var]
        elif location == "CONFIG":
            str_b = config[var]

        userscript_header = userscript_header.replace(str_a, str_b)

    userscript_header = userscript_header.split('"SPLIT_HERE"')
    userscript_header = [x.strip() for x in userscript_header]
    js = userscript_header[0] + "\n\n" + js
    js = js.replace('"USERSCRIPT_HEADER_HERE"', userscript_header[1])
    f_js0 = f_js0[:-3] + ".user.js"
    with open(f_js0, "w") as f_js:
        f_js.write(js)

    print("Deployed userscript: " + f_js0)

def fix_version_mismatch(manifest0, npm_package0):
    with open(manifest0, "r") as manifest:
        manifest_version = json.load(manifest)["version"]
    with open(npm_package0) as npm_package:
        npm_package_version = json.load(npm_package)["version"]
    
    if manifest_version != npm_package_version:
        print("Version mismatch!")
        fix_str = "Fixing {}: v{} -> v{}"
        if version_compare(manifest_version, npm_package_version):
            print(fix_str.format(npm_package0, npm_package_version, manifest_version))
            replace_in_file(npm_package0, npm_package_version, manifest_version)
        else:
            print(fix_str.format(manifest0, manifest_version, npm_package_version))
            replace_in_file(manifest0, manifest_version, npm_package_version)

    else:
        print("No version mismatch! Current version: " + manifest_version)
    
# version1 > version2: True
# version1 < version2: False
# version1 = version2: None
def version_compare(version1, version2):
    version1 = [int(x) for x in version1.split(".")]
    version2 = [int(x) for x in version2.split(".")]
    if len(version1) != len(version2):
        raise RuntimeError("Could not fix version mismatch", version1, version2)
    for i in range(len(version1)):
        if version1[i] != version2[i]:
            return version1[i] > version2[i]

    return None

def replace_in_file(file0, str1, str2):
    with open(file0, "r+") as f:
        content = f.read()
        content = content.replace(str1, str2)
        f.seek(0)           # go to start of file
        f.write(content)
        f.truncate()        # delete old contents

def main():
    fix_version_mismatch(MANIFEST0, NPM_PACKAGE0)
    with open(MANIFEST0, "r") as f_manifest:
        manifest = json.load(f_manifest)

    deploy_addon(manifest)
    deploy_userscript(manifest)

if __name__ == "__main__":
    main()
