FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci for more flexibility)
RUN npm install --production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p temp excel-logs

# Expose port
EXPOSE 5002

# Start the application
CMD ["node", "src/index.js"]