const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
 
  let filePath = '.' + req.url;
  if (filePath == './') {
    filePath = './index.html';
  }
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    // add more mime types if needed
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        // File not found. You could also serve a default favicon.ico here if you have one.
        res.writeHead(404);
        res.end("Not found");
      } else {
        // Other server errors
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(process.env.PORT || 3000);