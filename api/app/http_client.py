import requests


class TimeoutSession(requests.Session):
    def __init__(self, default_timeout=5):
        super().__init__()
        self.default_timeout = default_timeout

    def request(self, method, url, **kwargs):
        # Define o timeout padrão se ele não for passado manualmente na chamada
        kwargs.setdefault("timeout", self.default_timeout)
        return super().request(method, url, **kwargs)


# Instancia o cliente que você usará no projeto
client = TimeoutSession(default_timeout=5)
