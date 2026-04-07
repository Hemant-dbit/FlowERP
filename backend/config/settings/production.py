from .base import *  # noqa
import os

DEBUG = False
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["yourdomain.com"])

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Static files - ensure collectstatic is run in production
STATIC_ROOT = os.path.join(Path(__file__).resolve().parent.parent, "staticfiles")