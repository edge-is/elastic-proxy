# Elasticsearch proxy #


### Proxy that uses JWT tokens to check if user has access to resource ###

### Tokens: ###
```
// You can use '*' as wildcard
{
  "exp": <Date in ms>,
  "server": ["someserver.example.com"],
  "id": "client-id-321413241234",
  "method": [
    "GET",
    "POST"
  ],
  "index": [
    "myindex"
  ],
  "type": [
    "mytype"
  ],
  "action": [
    "_search", "_count"
  ]
}
```
You can create basic tokens here: [jwt.io](https://jwt.io/) 

### How it works ###
1. Client sends request to server with header: 'Authorization' : 'Bearer JWT_TOKEN'
2. Server checks if the token is valid based on secret and exp, optional you can check database for blacklisting
3. Server checks if client has access to the resource based on the token: /:index/:type/:action
4. if all ok, then the request is sent to the elasticsearch server based on upstream


### features ###
- JWT token
- Prefix the request
- Checks elasticsearch for \_status on interval
- Custom jwt check
- logging in json (bunyan)

### Todo ###
- Write tests
- More loadbalance algorithms (now random)
- Custom checks per upstream
- rewrite requests
