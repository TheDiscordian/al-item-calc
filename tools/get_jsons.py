import sys, json
#sys.path.append('../design')
# This is looking for design/items.py, if you put it in this directory, it'll find it.
from items import *

upgrades = {}
compounds = {}

for name in items.keys():
	item = items[name]
	if "upgrade" in item:
		upgrades[name] = item
	if "compound" in item:
		compounds[name] = item

open("upgrades.json", "w").write(json.dumps(upgrades, indent=2))
open("compounds.json", "w").write(json.dumps(compounds, indent=2))