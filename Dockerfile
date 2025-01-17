FROM node:20

# Set environment variable for the port
ENV PORT=3800

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli prisma typescript

# Set working directory inside the container
WORKDIR /src

# Copy and install dependencies
COPY package.json yarn.lock ./

COPY ./ ./

RUN yarn && npx prisma generate && yarn build

EXPOSE 3800

# Command to run the app in production
CMD ["yarn", "start:prod"]
