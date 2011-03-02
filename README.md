Shoutr
======

Shoutr is lightweight and extensible social networking platform built with <http://nodejs.org>.

*** Development has just started, don't waste your time trying to use/build this code. The instructions below are outdated, I'll refresh the documentation when releasing a stable 0.1 version. ***

Copyright (C) 2010 Laurent Eschenauer <laurent@eschenauer.be>

Design goals
------------

**Lighweight:** A small, fast, efficient, scalable (add your dream to the list) core service that manages users, profiles, activities and relationships. The underlying database is a key/value store and could be powered ny any NoSQL engine. The resources are exposed to clients via a REST API. 

**Extensible:** A plugin architecture that enable to easily add new features like:

*  Adding various federation protocols (such as ostatus, onesocialweb, diaspora, etc.)
*  Adding other client APIs (e.g. a status.net API or Opensocial) to benefit from existing clients
*  Adding user services that leverage federation (like a personal data store)
*  Adding data aggregation services (e.g. importing twitter, facebook data)
*  Inventing new stuff that leverage the decentralized social web

Beyond these ambitions, my goal is really to have a playground in which to experiment with the future of decentralized social services.

What it is not
--------------

Shoutr is not a complete solution and only focuses on the server side of things.

I do not intend to develop any client for socialJS; seeing this project more like "the apache of the social web" and I hope that others would build "the firefox of the social web". We need to decouple clients from servers so that while some focus on building the best services, other can invent the best clients. In my dream world, one could use the "social web client" of their choice with any "social web service", just like you can use any email client with any email provider.

It would be awesome if **you** start building a socialJS client for **your** favorite platform. Let me know and I'll do my best to hep out ! 
 

Getting started
===============

Install
-------

If you are using npm (the node packet manager), installing is as easy as:
    npm install shoutr


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
    node ./bin/shoutrd.js

License
=======

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
