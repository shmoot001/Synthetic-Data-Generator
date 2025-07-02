from celery import Celery

celery_app = Celery(
    "ctgan_tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)