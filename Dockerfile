FROM node:5.3.0

# krb5 is required by kerbros5,
# kerbros5 is required by mongodb.
RUN apt-get update && apt-get install -y libkrb5-dev \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app
EXPOSE 3000

CMD [ "npm", "start" ]
