FROM python:3.11 as requirements-stage
WORKDIR /tmp
RUN curl -sSL https://install.python-poetry.org | python3 -
COPY ./pyproject.toml ./poetry.lock* /tmp/
RUN ~/.local/share/pypoetry/venv/bin/poetry export -f requirements.txt --output requirements.txt --without-hashes
 
FROM public.ecr.aws/lambda/python:3.11
WORKDIR /code
COPY --from=requirements-stage /tmp/requirements.txt /code/requirements.txt
RUN yum update && yum install gcc -y
RUN pip3 install --no-cache-dir --upgrade -r /code/requirements.txt
COPY ./app /code/app
CMD ["app.hadler"]
