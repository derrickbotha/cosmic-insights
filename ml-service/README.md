# ML Service

Django-based Machine Learning microservice for Cosmic Insights. Provides vector embeddings, semantic search, and pattern analysis capabilities.

## Architecture

This ML service runs parallel to the existing Express backend:

- **Express Backend**: Handles authentication, payments, user data
- **Django ML Service**: Handles embeddings, vector search, ML processing
- **Shared MongoDB**: Both services access the same database
- **Communication**: REST API + shared database

## Services

### Core Services

1. **PostgreSQL** (port 5432): Stores ML metadata (documents, embeddings, experiments)
2. **Qdrant** (port 6333): Vector database for semantic search
3. **MinIO** (ports 9000, 9001): S3-compatible storage for datasets/models
4. **Redis** (port 6379): Message broker for Celery tasks
5. **Django API** (port 8000): REST API endpoints
6. **Celery Worker**: Background task processing
7. **Celery Beat**: Scheduled tasks (hourly journal sync)
8. **Flower** (port 5555): Celery monitoring UI

### Existing Services (Unchanged)

- **MongoDB** (port 27017): Main database
- **Express Backend** (port 5000): Main API
- **React Frontend** (port 3000): Web UI
- **Mongo Express** (port 8081): MongoDB admin UI

## API Endpoints

Base URL: `http://localhost:8000/api/v1/`

### Documents

- `GET /documents/` - List documents
- `POST /documents/` - Create document (auto-generates embedding)
- `GET /documents/{id}/` - Get document
- `DELETE /documents/{id}/` - Delete document
- `POST /documents/{id}/reindex/` - Re-generate embedding
- `POST /documents/bulk_create/` - Bulk create documents

### Embeddings

- `GET /embeddings/` - List embeddings
- `GET /embeddings/{id}/` - Get embedding

### Experiments

- `GET /experiments/` - List experiments
- `POST /experiments/` - Create experiment
- `GET /experiments/{id}/` - Get experiment

### Search

```bash
POST /search/
{
  "query": "I'm feeling anxious about my future",
  "user_id": "123",
  "document_type": "journal_entry",
  "top_k": 10,
  "score_threshold": 0.5
}
```

### Sync

```bash
POST /sync/
{
  "user_id": "123",  # optional
  "since": "2024-01-01T00:00:00Z",  # optional
  "force": false
}
```

### Health Check

```bash
GET /health/
```

## Setup

### 1. Start All Services

```bash
docker-compose up -d
```

This starts 12 containers:
- mongodb, backend, mongo-express (existing)
- postgres-ml, qdrant, minio, redis (new infrastructure)
- ml-service, celery-worker, celery-beat, flower (new ML services)

### 2. Run Database Migrations

```bash
docker-compose exec ml-service python manage.py migrate
```

### 3. Create Django Superuser (Optional)

```bash
docker-compose exec ml-service python manage.py createsuperuser
```

Access Django admin at: http://localhost:8000/admin/

### 4. Sync Existing Journal Entries

```bash
curl -X POST http://localhost:8000/api/v1/sync/ \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

## Monitoring

### Service Health

```bash
# ML Service health
curl http://localhost:8000/api/v1/health/

# Express backend health
curl http://localhost:5000/health

# Qdrant health
curl http://localhost:6333/health
```

### Celery Tasks

- **Flower UI**: http://localhost:5555
- View active tasks, worker status, task history

### MinIO Console

- **MinIO Console**: http://localhost:9001
- Login: minioadmin / minioadmin123
- View buckets: datasets, checkpoints, uploads

### Database Admin

- **Mongo Express**: http://localhost:8081 (admin/pass)
- **Django Admin**: http://localhost:8000/admin/

## Development

### Watch Logs

```bash
# All services
docker-compose logs -f

# ML service only
docker-compose logs -f ml-service

# Celery worker
docker-compose logs -f celery-worker
```

### Run Management Commands

```bash
# Django shell
docker-compose exec ml-service python manage.py shell

# Create migration
docker-compose exec ml-service python manage.py makemigrations

# Run tests
docker-compose exec ml-service python manage.py test
```

### Rebuild Service

```bash
docker-compose build ml-service
docker-compose up -d ml-service
```

## Usage Examples

### 1. Create Document with Embedding

```bash
curl -X POST http://localhost:8000/api/v1/documents/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "123",
    "title": "Morning Reflection",
    "text": "Today I felt grateful for the small moments of joy",
    "document_type": "journal_entry",
    "metadata": {"mood": "grateful"}
  }'
```

### 2. Semantic Search

```bash
curl -X POST http://localhost:8000/api/v1/search/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "feeling happy and content",
    "user_id": "123",
    "top_k": 5
  }'
```

### 3. Trigger Journal Sync

```bash
curl -X POST http://localhost:8000/api/v1/sync/ \
  -H "Content-Type: application/json" \
  -d '{"user_id": "123"}'
```

## Data Flow

### Journal Entry Creation

1. User creates journal entry in React app
2. Express backend saves to MongoDB
3. Hourly Celery Beat triggers sync task
4. Celery worker:
   - Fetches new entries from MongoDB
   - Creates Document records in PostgreSQL
   - Queues embedding generation tasks
5. Embedding worker:
   - Loads SentenceTransformer model
   - Generates 384-dimensional vector
   - Indexes to Qdrant
   - Updates Document status to "completed"

### Semantic Search

1. User enters search query in React app
2. Frontend calls Express API
3. Express proxies to Django ML service
4. Django:
   - Generates query embedding
   - Searches Qdrant for similar vectors
   - Filters by user_id and document_type
   - Returns top K results with scores
5. Frontend displays results

## Troubleshooting

### Service Won't Start

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs ml-service

# Restart service
docker-compose restart ml-service
```

### Database Connection Error

```bash
# Check PostgreSQL
docker-compose exec postgres-ml psql -U mluser -d cosmic_ml -c "SELECT 1"

# Check MongoDB
docker-compose exec mongodb mongosh cosmic-insights --eval "db.stats()"
```

### Embedding Generation Failed

```bash
# Check Celery worker logs
docker-compose logs celery-worker

# Check Flower UI
open http://localhost:5555

# Retry failed documents
docker-compose exec ml-service python manage.py shell
>>> from app.models import Document
>>> failed = Document.objects.filter(embedding_status='failed')
>>> for doc in failed:
...     doc.embedding_status = 'pending'
...     doc.save()
```

### Qdrant Collection Issues

```bash
# Check collections
curl http://localhost:6333/collections

# Recreate collection
docker-compose exec ml-service python manage.py shell
>>> from app.services.qdrant_service import QdrantService
>>> qs = QdrantService()
>>> qs.get_client().delete_collection('cosmic_embeddings')
>>> qs.initialize_collection()
```

## Configuration

### Environment Variables

See `.env` file for all configuration options.

Key settings:

- `EMBEDDING_MODEL`: HuggingFace model name (default: all-MiniLM-L6-v2)
- `EMBEDDING_DIMENSION`: Vector dimension (default: 384)
- `MAX_SEQUENCE_LENGTH`: Max tokens (default: 512)
- `CELERY_BROKER_URL`: Redis connection for task queue
- `EXPRESS_API_URL`: URL of Express backend

### Django Settings

Edit `ml-service/config/settings.py` for advanced configuration.

## Performance

### Embedding Generation

- Model: all-MiniLM-L6-v2 (fast, lightweight)
- Speed: ~100-200 texts/second on CPU
- Batch processing: 32 texts at a time
- Model size: ~90MB (cached after first load)

### Vector Search

- Qdrant HNSW index (fast approximate search)
- Search latency: <50ms for 10K vectors
- Scales to millions of vectors

### Celery Workers

- Default: 2 concurrent workers
- Increase for higher throughput:
  ```bash
  docker-compose exec celery-worker celery -A config worker -l info --concurrency=4
  ```

## Next Steps

1. **Frontend Integration**: Add semantic search UI to React app
2. **Pattern Analysis**: Implement clustering for pattern detection
3. **Enhanced ML**: Add fine-tuning capabilities
4. **Real-time Sync**: WebSocket integration for instant embedding generation
5. **Multi-model Support**: Add support for OpenAI, Cohere embeddings

## License

Same as parent project.
