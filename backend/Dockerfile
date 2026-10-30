FROM python:3.12-slim
WORKDIR /app
COPY . .
ENV BRIEF_HOST=0.0.0.0
USER 65534:65534
EXPOSE 8089
CMD ["python", "service.py"]
