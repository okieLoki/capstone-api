FROM node:20.11.1

# Install Chromium and other dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros \
  fonts-kacst fonts-freefont-ttf \
  libxss1 \
  dbus \
  dbus-x11 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
# Set the working directory
WORKDIR /app
RUN which chromium
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# If using Puppeteer, you might need to set the executable path to Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy your application code into the Docker image
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]