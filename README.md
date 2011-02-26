social.js
=========

Social.js is decentralized social networking server. It can federate with any other host supporting the [OStatus](http://ostatus.org) protocol.

*** Ongoing development on the master branch until I reach a first stable 0.1 release ***

Copyright (C) 2010 Laurent Eschenauer <laurent@eschenauer.be>

Install
-------

If you are using npm (the node packet manager), installing is as easy as:
    npm install social.js


Dependencies
------------

If you are using this from source, you can install the dependencies using npm from the root of the source folder:
    npm bundle

Or you can install all dependencies manually:
- [node](http://nodejs.org/) v4+ is required, I'm developing against trunk.
- [node-ostatus](http://github.com/eschnou/node-ostatus/)

Usage
-----

Add a user with the following command:
    node ./bin/admin.js add_user --username alice --password wonderland --email alice@wonderland.lit

Run the server by launching the script in bin/:
    node ./bin/social.js

License
-------

The MIT License

Copyright (c) 2010 Laurent Eschenauer <laurent@eschenauer.be>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
