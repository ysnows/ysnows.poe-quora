import yaml
import json
import sys
from pathlib import Path


def update_appcast(message,repo_name):
    with open('main.yml', 'r') as file:
        yaml_file = yaml.safe_load(file)
        version = yaml_file['version']
        minAppVersion = yaml_file['minAppVersion']

    # 获取hello
    name = repo_name.split('/')[1]
    version_info = {
        "version": version,
        "desc": message,
        "url": f"https://github.com/{repo_name}/releases/download/v{version}/{name}.enconvoplugin",
        "minAppVersion": minAppVersion
    }
    appcast_file = Path("appcast.json")
    if appcast_file.is_file():
        with open(appcast_file, "r") as f:
            appcast = json.load(f)
    appcast["versions"].insert(0, version_info)
    with open(appcast_file, "w") as f:
        json.dump(appcast, f, ensure_ascii=False, indent=2)
    print(f"v{version}")


if __name__ == "__main__":
    message = sys.argv[1]
    repo_name = sys.argv[2]
    update_appcast(message,repo_name)
