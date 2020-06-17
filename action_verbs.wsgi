#!/usr/bin/python
activate_this = '/var/www/action-verbs-thesaurus/venv/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/var/www/action-verbs-thesaurus")

from action_verbs import app as application
