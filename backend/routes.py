"""HTTP route table for the for-takt dashboard (DESIGN-ui §3).

The gateway loads ``backend.routes:register_routes`` into a synthetic
package rooted at the app directory, so every import here is relative.
No path parameters: inputs arrive as query (GET) or JSON body (POST).
"""

from dataclasses import dataclass
from typing import Callable

from . import handlers


@dataclass(frozen=True)
class Route:
    method: str
    path: str
    handler: Callable


def register_routes(ctx):
    sdk = getattr(ctx, "sdk_level", 0)
    if sdk < 1:
        health = getattr(ctx, "health", None)
        if health is not None:
            health.mark_degraded(
                "for-takt requires App Kit seam level 1 (owner gate); "
                f"host provides {sdk}"
            )
    return [
        Route("GET", "/health", handlers.health),
        Route("GET", "/settings", handlers.get_settings),
        Route("POST", "/settings/takt-mcp", handlers.set_takt_mcp),
        Route("GET", "/takt/config", handlers.get_takt_config),
        Route("POST", "/takt/config", handlers.set_takt_config),
        Route("GET", "/projects", handlers.list_projects),
        Route("POST", "/projects/add", handlers.add_project),
        Route("POST", "/projects/remove", handlers.remove_project),
        Route("POST", "/directories", handlers.browse_directories),
        Route("POST", "/projects/clone", handlers.clone_project),
        Route("GET", "/goals", handlers.list_goals),
        Route("GET", "/goal", handlers.get_goal),
        Route("POST", "/goal/status", handlers.set_goal_status),
        Route("POST", "/goal/answer", handlers.answer_question),
        Route("GET", "/takt/tasks", handlers.takt_tasks),
        Route("GET", "/takt/run", handlers.takt_run),
        Route("GET", "/takt/run/log", handlers.takt_run_log),
        Route("GET", "/takt/run/report", handlers.takt_run_report),
        Route("GET", "/takt/goal-files", handlers.takt_goal_files),
    ]
