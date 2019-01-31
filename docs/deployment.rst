Deployment
==========

My aim to have a **Couchbase/Express/Client** stack running on AWS_.

`Nautilus Server`_ is a Node_ Express_ application that provides the logic
layer between `Nautilus Client`_ and the Couchbase_ NoSQL database.

Found recipe for installing Couchbase_ Community Edition but some configuration
needs attention. Here I shall try to document my solutions.

In particular I need to sort out the available routes that I can use to query
Couchbase from `Nautilus Server`_.

These are::

   CouchbaseServerLocation
   SSHLocation
   TCPLocation

Which are ranges of IP adresses in CIDR format: `x.x.x.x/x`.

Marketplace
===========

The recipe that should work for me is `Couchbase Server with Sync Gateway Community Edition`. I choose to install with **Launch CloudFormation**, then I get to the parameters that confuse me. Do I find these in the **routes** of the EC2 instance?

So I stopped at this point and turned to deploying the Express_ application first to see if that helps spot some clues.

.. _AWS: http://aws.amazon.com/
.. _Couchbase: http://www.couchbase.com/
.. _Node: http://www.nodejs.org/
.. _Express: http://www.expressjs.com/
.. _`Nautilus Client`: https://github.com/darrylcousins/nautilus-client
.. _`Nautilus Server`: https://github.com/darrylcousins/nautilus-server
