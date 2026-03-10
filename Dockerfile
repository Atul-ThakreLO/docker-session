# =============================================================
# Dockerfile for User Management API
# =============================================================
# A Dockerfile is a text file containing instructions to build
# a Docker image. Each instruction creates a "layer" in the image.
# =============================================================

# -------------------------------------------------------------
# Stage 1: Base Image
# -------------------------------------------------------------
# FROM specifies the base image to start from.
# We use node:20-alpine because:
# - node:20 gives us Node.js version 20 (LTS)
# - alpine is a minimal Linux distribution (~5MB vs ~900MB for full)
# - Smaller images = faster downloads, less storage, smaller attack surface
FROM node:20-alpine

# -------------------------------------------------------------
# Set Working Directory
# -------------------------------------------------------------
# WORKDIR sets the working directory for subsequent instructions.
# All following commands (COPY, RUN, CMD) will execute from /app
# If the directory doesn't exist, Docker creates it automatically.
WORKDIR /app

# -------------------------------------------------------------
# Copy Package Files First (Layer Caching Optimization)
# -------------------------------------------------------------
# COPY copies files from host machine to the container.
# 
# WHY COPY package*.json FIRST?
# Docker caches each layer. If a layer hasn't changed, Docker reuses it.
# By copying package.json separately before source code:
# - If only source code changes, npm install layer is cached (reused)
# - This significantly speeds up builds during development
# 
# The pattern package*.json matches both package.json and package-lock.json
COPY package*.json ./

# -------------------------------------------------------------
# Install Dependencies
# -------------------------------------------------------------
# RUN executes commands during the image build process.
# npm install reads package.json and installs all dependencies.
# 
# For production, you might use: npm ci --only=production
# - npm ci is faster and more reliable for CI/CD
# - --only=production skips devDependencies
RUN npm install

# -------------------------------------------------------------
# Copy Application Source Code
# -------------------------------------------------------------
# Now copy the rest of the application code.
# The .dockerignore file excludes node_modules, .env, etc.
# 
# COPY <source> <destination>
# "." means current directory on host, "./" means WORKDIR in container
COPY . .

# -------------------------------------------------------------
# Document the Port
# -------------------------------------------------------------
# EXPOSE documents which port the container listens on.
# This is informational only - it doesn't actually publish the port.
# You still need -p flag or ports: in docker-compose.yml to publish.
EXPOSE 3000

# -------------------------------------------------------------
# Health Check (Optional but Recommended)
# -------------------------------------------------------------
# HEALTHCHECK tells Docker how to verify the container is working.
# Docker will run this command periodically to check container health.
# 
# --interval: How often to check (default 30s)
# --timeout: Max time for check to complete (default 30s)
# --retries: Number of failures before marking unhealthy (default 3)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# -------------------------------------------------------------
# Start the Application
# -------------------------------------------------------------
# CMD specifies the default command to run when container starts.
# 
# There are two forms:
# - Shell form: CMD npm start (runs in a shell)
# - Exec form: CMD ["node", "src/index.js"] (runs directly, preferred)
# 
# Exec form is preferred because:
# - Process receives signals directly (important for graceful shutdown)
# - No shell processing overhead
# - More explicit about what's running
CMD ["node", "src/index.js"]
