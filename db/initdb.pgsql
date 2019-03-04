-- Drops previous sightings table
DROP TABLE IF EXISTS sightings;

-- Create app table
CREATE TABLE IF NOT EXISTS sightings (
    id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    bear_type VARCHAR(20) NOT NULL,
    notes TEXT NOT NULL,
    zip_code INT NOT NULL,
    num_bears SMALLINT NOT NULL,
    createdat TIMESTAMP NOT NULL,
    updatedat TIMESTAMP NOT NULL
);