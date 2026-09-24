FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# V13 fix: python:3.11-slim ships no non-root user, so create one.
# uid/gid 1000 is chosen to match node:alpine's built-in "node" user
# (used above), keeping ownership consistent across all 9 services —
# useful since the k8s securityContext below sets runAsUser: 1000 for
# every service.
RUN groupadd --gid 1000 appuser \
    && useradd --uid 1000 --gid appuser --create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 5008
CMD ["python", "app.py"]
