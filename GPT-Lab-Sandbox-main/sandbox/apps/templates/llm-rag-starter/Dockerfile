FROM python:3.11-slim@sha256:9a9a1d7f6e3a1ad4a0a43a9a2b2c7e38cd7f9f7fdc0713c5b39afbe9c4f1d4e9

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN useradd -m -u 10001 appuser

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip pip install --no-cache-dir -r requirements.txt

COPY entrypoint.sh /entrypoint.sh
COPY notebooks /workspace/notebooks
RUN chmod +x /entrypoint.sh

USER 10001
ENTRYPOINT ["/entrypoint.sh"]


