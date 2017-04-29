service nginx start

cd /root/sqlwidget/ui
serve build -p 3001 &

cd /root/sqlwidget/api
npm start
