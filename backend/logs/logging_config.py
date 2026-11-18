
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

# Log directory
LOG_DIR = Path(__file__).resolve().parent
LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "application.log"

# Log format
LOG_FORMAT = (
    "%(asctime)s | %(levelname)s | "
    "%(name)s | %(message)s"
)

DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

formatter = logging.Formatter(
    LOG_FORMAT,
    datefmt=DATE_FORMAT
)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

# Rotating file handler
file_handler = RotatingFileHandler(
    LOG_FILE,
    maxBytes=5 * 1024 * 1024,
    backupCount=5,
    encoding="utf-8"
)
file_handler.setFormatter(formatter)

# Dedicated application logger
logger = logging.getLogger("student_management")
logger.setLevel(logging.INFO)
logger.propagate = False

# Prevent duplicate handlers
if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
