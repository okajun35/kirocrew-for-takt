"""Host security helpers, used without a hard kiro_crew dependency.

Backend hooks run inside the gateway, where ``kiro_crew`` is importable;
the stdio MCP server does not, and must never reach this module's gateway
functions (it doesn't). Anything importable here degrades deterministically:

* :func:`is_sensitive` fails CLOSED — an unknown path is treated as
  protected, matching the host's own rule that an unreadable ceiling is a
  blocked path, not an open one.
* :func:`redact` keeps a built-in pattern floor when the host's scanner is
  unavailable, so served text still masks the common credential shapes.
"""

import os
import re
from pathlib import Path

try:
    from kiro_crew.security import is_sensitive_path as _host_is_sensitive
    from kiro_crew.security import redact_credentials as _host_redact

    _HAS_HOST = True
except Exception:  # pragma: no cover - outside the gateway
    _host_is_sensitive = None
    _host_redact = None
    _HAS_HOST = False


def is_sensitive(path) -> bool:
    """True when the host protects *path*, or when it cannot tell."""
    if _host_is_sensitive is None:
        return True
    try:
        return bool(_host_is_sensitive(str(path)))
    except Exception:  # pragma: no cover - defensive
        return True


def realpath(path):
    return Path(os.path.realpath(str(path)))


#: Compact credential shapes masked after the host's own pass; masking a
#: harmless string beats leaking a key into the dashboard.
_FALLBACK_SECRET_RE = re.compile(
    r"(?:(?:AKIA|ASIA)[0-9A-Z]{16})"
    r"|(?:(?i:bearer)\s+[A-Za-z0-9._\-]{16,})"
    r"|(?:(?i:api[_-]?key|secret|password|token)\s*[:=]\s*\S{8,})"
    r"|(?:gh[pousr]_[A-Za-z0-9]{16,})"
    r"|(?:xox[baprs]-[A-Za-z0-9-]{10,})"
    r"|(?:-{5}BEGIN[A-Z ]*PRIVATE KEY-{5}[\s\S]*?-{5}END[A-Z ]*PRIVATE KEY-{5})"
)


def redact(text):
    """Mask credential-shaped text before it leaves the process."""
    if not text:
        return text
    out = text
    if _host_redact is not None:
        try:
            result = _host_redact(out)
            out = str(result[0]) if isinstance(result, tuple) else str(result)
        except Exception:  # pragma: no cover - defensive
            pass
    return _FALLBACK_SECRET_RE.sub("<redacted>", out)
