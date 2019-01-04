Indexes
=======

Setting up indexes confused me a first but it seems that an index needs to be
created for every field to be searched on. In the most general case we need
`type` to be indexed so that this query will work::

   SELECT META(account).id, account.* FROM `sandbox` AS account WHERE account.type = 'account'

To create this index (this can be run from within the couchbase console)::

   CREATE INDEX `idx_sandbox_type` ON `sandbox`(`type`);

More learning required to create full text search indexes, but likely something
like this should work::

   CREATE INDEX `idx_sandbox_text` ON `sandbox`(`firstname`, `lastname`, `email`);

