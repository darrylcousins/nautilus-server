Install Docker
==============

Login as root::

   $ sudo su -

Remove old versions::

   $ dnf remove -y docker docker-common container-selinux docker-selinux docker-engine

Continue
--------

Install curl::

   $ dnf -y install curl

Add repo::

   $ curl -o /etc/yum.repos.d/docker-ce.repo https://download.docker.com/linux/fedora/docker-ce.repo

Install docker::

   $ dnf -y install docker-ce

Start docker::

   $ systemctl start|stop docker


Install And Run Cloudbase
=========================

Install::

   $ docker run -d --name db -p 8091-8096:8091-8096 -p 11210-11211:11210-11211 couchbase

And run::

   $ sudo docker run -d --name db -p 8091-8096:8091-8096 -p 11210-11211:11210-11211 couchbase/server

Check docker logs::

   $ docker logs db

To restart the database::

   $ docker restart db

And log in to http://localhost:8091/ administrator:car3tak3
