FROM public.ecr.aws/docker/library/python:3.9.15-slim-bullseye AS build

WORKDIR /root

RUN apt-get update && apt-get install -y \
    curl \
    git \
    git-lfs

# sudo yum install git-lfs

#RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

#RUN git lfs install
#RUN git clone --depth=1 https://huggingface.co/facebook/bart-large-mnli
#RUN rm -rf bart-large-mnli/.git

COPY requirements.txt ./requirements.txt

########################################

FROM public.ecr.aws/lambda/python:3.9.2022.10.26.12

#COPY --from=build /root/bart-large-mnli ./bart-large-mnli

RUN yum install postgresql python-devel postgresql-devel postgresql-libs gcc -y

COPY --from=build /root/requirements.txt ./
RUN pip install -r requirements.txt --target "$LAMBDA_RUNTIME_DIR" && rm -rf /root/.cache

RUN curl --create-dirs -o /opt/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/0e46e9b1-fd2c-4346-a0bf-92132a781835/cert && chmod 755 -R /opt/.postgresql

COPY main.py ./

ENV HF_HOME="/tmp"

CMD ["main.handler"]
