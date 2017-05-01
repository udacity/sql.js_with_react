service nginx start

cd /root/sqlwidget/api
npm start &

until curl localhost:3000/initdb -f; do
  sleep 1
done

cd /root/sqlwidget/ui
serve build -p 3001 
