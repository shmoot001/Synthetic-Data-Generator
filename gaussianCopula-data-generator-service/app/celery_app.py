# app/celery_app.py
import os
from celery import Celery

BROKER = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
BACKEND = os.getenv("CELERY_RESULT_BACKEND", BROKER)
QUEUE = os.getenv("GAUSSIAN_QUEUE", "gaussian")  

celery_app = Celery(
    "gaussian_copula_tasks",
    broker=BROKER,
    backend=BACKEND,
    include=["app.tasks.train_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_default_queue=QUEUE,
    task_queues={
        QUEUE: {"exchange": QUEUE, "routing_key": QUEUE},
    },
    task_routes={
        # rikta specifika tasks till gaussian-kön
        "app.tasks.train_tasks.train_gaussian_model": {"queue": QUEUE},
    },
)
