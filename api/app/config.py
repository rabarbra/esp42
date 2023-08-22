"""Websocket server configuration as here"""
FRONTEND_ENDPOINT = 'http://esp42.eu'
DEV_PORT = 8080
DEV_HOST = "localhost"

log_config = {
	'version': 1,
	"disable_existing_loggers": True,
	"formatters": {
    "default": {
            "()":"uvicorn.logging.DefaultFormatter",
            "fmt": "%(levelprefix)s %(message)s",
            "use_colors":"None"
        }
    },
    "handlers": {
        "default": {
           "formatter":"default",
           "class":"logging.StreamHandler",
           "stream":"ext://sys.stderr"
        }
    },
    'loggers': {}
}