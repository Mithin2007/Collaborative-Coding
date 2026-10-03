-- Runs once, on first initialisation of the data volume.
-- Separate database for the DB test suite (TEST_DATABASE_URL).
-- The test run RESETS this database; never point TEST_DATABASE_URL at real data.
CREATE DATABASE invenzo_test;
