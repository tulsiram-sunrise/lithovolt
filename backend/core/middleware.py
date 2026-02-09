"""Middleware for request logging."""
import time
import logging


logger = logging.getLogger('lithovolt.request')


class RequestLoggingMiddleware:
    """Log basic request info and duration."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration_ms = (time.time() - start_time) * 1000

        logger.info(
            '%s %s %s %.2fms',
            request.method,
            request.path,
            response.status_code,
            duration_ms
        )
        return response
