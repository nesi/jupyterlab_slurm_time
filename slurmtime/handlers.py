import os
import json
import subprocess

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado


class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        jobid = os.environ.get("SLURM_JOB_ID")
        data = None
        if jobid is not None:
            result = subprocess.run(["squeue", "--noheader", "-O", "TimeLeft", "-j", jobid],
                                    capture_output=True, text=True)
            if result.returncode == 0:
                data = result.stdout.strip()

        self.finish(json.dumps({
            "data": data,
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "slurmtime", "get_time_remaining")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
