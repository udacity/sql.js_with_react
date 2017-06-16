FROM node:7.9

RUN apt-get update
RUN apt-get install nginx -y

RUN npm install -g serve

# Create directories
RUN mkdir -p /root/sqlwidget/api
RUN mkdir -p /root/sqlwidget/ui
RUN mkdir -p /opt/sqlwidget/

# Install app dependencies
COPY api/package.json /root/sqlwidget/api
WORKDIR /root/sqlwidget/api
RUN npm install

COPY ui/package.json /root/sqlwidget/ui
WORKDIR /root/sqlwidget/ui
RUN npm install

# Add nginx conf
COPY nginx/nginx.conf /etc/nginx
COPY nginx/launch.sh /root/sqlwidget

# Bundle app source
COPY api /root/sqlwidget/api
COPY ui /root/sqlwidget/ui

# Build static ui
WORKDIR /root/sqlwidget/ui
RUN npm run build

EXPOSE 40002
CMD ["bash", "/root/sqlwidget/launch.sh"]
