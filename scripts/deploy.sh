#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warn ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_info ".env file created. Please edit it with your configuration."
    else
        print_error ".env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if JWT_SECRET is set and has minimum length
if grep -q "JWT_SECRET=your-super-secret" .env || grep -q "JWT_SECRET=$" .env; then
    print_error "JWT_SECRET must be set in .env file with at least 32 characters"
    exit 1
fi

# Parse command line arguments
MODE=${1:-production}
COMPOSE_FILE="docker-compose.yml"

if [ "$MODE" = "dev" ] || [ "$MODE" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    print_info "Starting in DEVELOPMENT mode"
else
    print_info "Starting in PRODUCTION mode"
fi

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build and start services
start_services() {
    print_info "Building Docker images..."
    docker-compose -f $COMPOSE_FILE build

    print_info "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d

    print_info "Waiting for services to be healthy..."
    sleep 5

    # Check API health
    if [ "$MODE" != "dev" ]; then
        print_info "Checking API health..."
        max_attempts=30
        attempt=0
        while [ $attempt -lt $max_attempts ]; do
            if curl -f http://localhost:3000/health > /dev/null 2>&1; then
                print_info "API is healthy!"
                break
            fi
            attempt=$((attempt + 1))
            sleep 2
        done

        if [ $attempt -eq $max_attempts ]; then
            print_warn "API health check timed out. Check logs with: docker-compose logs api"
        fi
    fi

    print_info "Services started successfully!"
    print_info ""
    print_info "API: http://localhost:3000"
    if [ "$MODE" = "dev" ]; then
        print_info "Web: http://localhost:5173"
    else
        print_info "Web: http://localhost"
    fi
    print_info ""
    print_info "View logs: docker-compose -f $COMPOSE_FILE logs -f"
    print_info "Stop services: docker-compose -f $COMPOSE_FILE down"
}

# Function to run migrations
run_migrations() {
    print_info "Running database migrations..."
    if [ "$MODE" = "dev" ]; then
        docker-compose -f $COMPOSE_FILE exec api pnpm prisma migrate deploy || \
        docker-compose -f $COMPOSE_FILE exec api pnpm prisma migrate dev
    else
        docker-compose -f $COMPOSE_FILE exec api pnpm prisma migrate deploy
    fi
    print_info "Migrations completed!"
}

# Main execution
check_docker

case "${2:-start}" in
    start)
        start_services
        if [ "$MODE" != "dev" ]; then
            sleep 3
            run_migrations
        fi
        ;;
    stop)
        print_info "Stopping services..."
        docker-compose -f $COMPOSE_FILE down
        print_info "Services stopped!"
        ;;
    restart)
        print_info "Restarting services..."
        docker-compose -f $COMPOSE_FILE restart
        print_info "Services restarted!"
        ;;
    logs)
        docker-compose -f $COMPOSE_FILE logs -f "${3:-}"
        ;;
    migrate)
        run_migrations
        ;;
    build)
        print_info "Building Docker images..."
        docker-compose -f $COMPOSE_FILE build
        print_info "Build completed!"
        ;;
    *)
        echo "Usage: $0 [dev|production] [start|stop|restart|logs|migrate|build] [service]"
        echo ""
        echo "Examples:"
        echo "  $0 dev start          # Start in development mode"
        echo "  $0 production start   # Start in production mode"
        echo "  $0 dev logs api      # View API logs in development"
        echo "  $0 production migrate # Run migrations in production"
        exit 1
        ;;
esac

