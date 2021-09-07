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
        # get the slurm job id
        jobid = os.environ.get("SLURM_JOB_ID")
        time_left = None
        # if in a slurm job
        if jobid is not None:
            # request time remaining from squeue
            result = subprocess.run(
                ["squeue", "--noheader", "-O", "TimeLeft", "-j", jobid],
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                time_left = result.stdout.split("\n")[0].strip()

                # nicer format from dd-hh:mm:ss
                array = time_left.split("-")
                time_left_hms = array.pop()  # HH:MM:SS
                days = int(array.pop()) if len(array) else 0
                days_text = f"{days}d " if days > 0 else ""
                array = time_left_hms.split(":")
                array.pop()  # don't care about seconds
                minutes = int(array.pop()) if len(array) else 0
                hours = int(array.pop()) if len(array) else 0
                time_left = f"{days_text}{hours}h {minutes}m"

        self.finish(json.dumps({
            "data": time_left,
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "jupyterlab-slurm-time", "get_time_remaining")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
