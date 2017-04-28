FROM node:7.9

# Create app directory
RUN mkdir -p /root/sqlwidget
WORKDIR /root/sqlwidget

# Install app dependencies
COPY package.json /root/sqlwidget
RUN npm install

# Bundle app source
COPY . /root/sqlwidget

EXPOSE 3000
CMD [ "npm", "start" ]
