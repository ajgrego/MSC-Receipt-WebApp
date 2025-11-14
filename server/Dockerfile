FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci for more flexibility)
RUN npm install --production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p temp excel-logs

# Expose port
EXPOSE 5002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5002/health || exit 1

# Start the application
CMD ["node", "src/index.js"]