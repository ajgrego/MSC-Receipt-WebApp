FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install system dependencies for health checks and Puppeteer
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies (using npm install instead of npm ci for more flexibility)
RUN npm install --production

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