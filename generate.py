import jinja2
import pprint
import sys
import yaml

with open('data.yml') as fh:
  data = yaml.safe_load(fh)

env = jinja2.Environment(loader=jinja2.FileSystemLoader('.'))
template = env.get_template('karaoke.html.jinja2')

data = dict(sorted(
  data.items(), key=lambda item: (item[1]['Miasto'], item[0])))
print(pprint.pformat(data), file=sys.stderr)
output = template.render(data=data)
print(output)
