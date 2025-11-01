FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p temp excel-logs

# Expose port
EXPOSE 5002

# Start the application
CMD ["node", "src/index.js"]