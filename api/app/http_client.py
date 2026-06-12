from typing import Any

import requests


class TimeoutSession(requests.Session):
    """
    Custom HTTP request wrapper injecting non-blocking execution timeout fallback constraints.
    """

    def __init__(self, default_timeout: int = 5) -> None:
        super().__init__()
        self.default_timeout = default_timeout

    def request(self, method: str, url: str, **kwargs: Any) -> requests.Response:
        kwargs.setdefault("timeout", self.default_timeout)
        return super().request(method=method, url=url, **kwargs)


client = TimeoutSession(default_timeout=5)
